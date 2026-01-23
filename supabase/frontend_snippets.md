# Frontend snippets for Supabase signup and redirect

## Signup with role in metadata

```ts
// supabase client must be initialized
export async function signUpWithRole(email: string, password: string, role: 'candidat'|'entreprise'|'admin', full_name?: string) {
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    { data: { role, full_name } }
  );
  if (error) throw error;
  return data;
}
```

## Redirect after login based on role

```ts
async function handlePostLoginRedirect(router) {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  let role = user?.user_metadata?.role;

  if (!role) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
    role = profile?.role;
  }

  if (role === 'candidat') router.push('/dashboard/candidat');
  else if (role === 'entreprise') router.push('/dashboard/entreprise');
  else if (role === 'admin') router.push('/admin/dashboard');
  else router.push('/');
}
```

Notes:
- Prefer fetching role from `profiles` DB for authoritative source.
- Ensure Supabase signup includes `options.data.role` as shown.

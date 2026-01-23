import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Briefcase, Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";

const LoginUser = () => {
  const navigate = useNavigate();
  const { user, signIn } = useSupabaseAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // If there's a redirect param, go there
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      
      if (redirect) {
        navigate(redirect);
      } else {
        // Redirect all users to newsfeed
        navigate('/');
      }
    }
  }, [user, navigate, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, user: signedUser } = await signIn(email, password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Connexion réussie !");
      // Use the user returned by signIn (or stored in localStorage) to decide redirect
      const currentUser = signedUser || JSON.parse(localStorage.getItem('user') || 'null');
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');

      if (redirect) {
        navigate(redirect);
      } else {
        // Redirect all users to newsfeed
        navigate('/');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
        <Card className="w-full max-w-md p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 mx-auto">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Connexion à Emploi+</h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre compte candidat ou entreprise
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="font-normal cursor-pointer">
                Se souvenir de moi
              </Label>
            </div>
            <Link to="/inscription" className="text-sm text-primary hover:underline">
              Créer un compte
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Ou</span>
            </div>
          </div>

          <GoogleLoginButton
            onSuccess={(user) => {
              toast.success("Connexion réussie avec Google !");
              const params = new URLSearchParams(location.search);
              const redirect = params.get('redirect');
              
              if (redirect) {
                navigate(redirect);
              } else {
                // Redirect all users to newsfeed
                navigate('/');
              }
            }}
            onError={(error) => {
              toast.error(error?.message || "Erreur lors de la connexion Google");
            }}
            className="w-full"
          />
        </form>

       
      </Card>
      </div>
      
      <AuthFooter />
    </div>
  );
};

export default LoginUser;

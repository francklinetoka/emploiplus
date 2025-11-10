-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_offers', 'admin_users', 'company', 'candidate');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table for candidates
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT,
  sector TEXT,
  profile_picture TEXT,
  professional_title TEXT,
  skills TEXT[],
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'network', 'private')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create company_profiles table
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  representative_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  logo TEXT,
  description TEXT,
  sector TEXT,
  website TEXT,
  company_size TEXT,
  company_type TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'network', 'private')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- Create documents table for file management
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create job_offers table
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('CDI', 'CDD', 'Stage', 'Freelance', 'Appel à projet')),
  contact_email TEXT,
  contact_phone TEXT,
  external_link TEXT,
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'network', 'private')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;

-- Create formations table
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT,
  level TEXT,
  price DECIMAL(10,2),
  instructor TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;

-- Create publications table for newsfeed
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'network', 'private')),
  is_active BOOLEAN DEFAULT true,
  reactions JSONB DEFAULT '{}',
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view public profiles"
  ON public.profiles FOR SELECT
  USING (visibility = 'public' OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Company profiles policies
CREATE POLICY "Users can view public company profiles"
  ON public.company_profiles FOR SELECT
  USING (visibility = 'public' OR auth.uid() = id);

CREATE POLICY "Companies can insert their own profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Companies can update their own profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- Job offers policies
CREATE POLICY "Everyone can view active public job offers"
  ON public.job_offers FOR SELECT
  USING (is_active = true AND visibility = 'public');

CREATE POLICY "Companies and admins can create job offers"
  ON public.job_offers FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'company') OR 
    public.has_role(auth.uid(), 'admin_offers') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Creators can update their job offers"
  ON public.job_offers FOR UPDATE
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete job offers"
  ON public.job_offers FOR DELETE
  USING (
    auth.uid() = created_by OR 
    public.has_role(auth.uid(), 'admin_offers') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Formations policies
CREATE POLICY "Everyone can view active formations"
  ON public.formations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage formations"
  ON public.formations FOR ALL
  USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin_offers')
  );

-- Publications policies
CREATE POLICY "Users can view active public publications"
  ON public.publications FOR SELECT
  USING (is_active = true AND visibility = 'public');

CREATE POLICY "Companies and admins can create publications"
  ON public.publications FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'company') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Authors can update their publications"
  ON public.publications FOR UPDATE
  USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete publications"
  ON public.publications FOR DELETE
  USING (
    auth.uid() = author_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert appropriate profile based on user metadata
  IF NEW.raw_user_meta_data->>'account_type' = 'candidate' THEN
    INSERT INTO public.profiles (id, first_name, last_name, email, country)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      NEW.raw_user_meta_data->>'country'
    );
    
    -- Assign candidate role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'candidate');
    
  ELSIF NEW.raw_user_meta_data->>'account_type' = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name, representative_name, email, address)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'representative_name',
      NEW.email,
      NEW.raw_user_meta_data->>'address'
    );
    
    -- Assign company role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'company');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON public.formations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publications_updated_at
  BEFORE UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
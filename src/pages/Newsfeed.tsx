import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, ThumbsUp, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Newsfeed = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user?.id);
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPublications();
    }
  }, [user]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('publications')
        .insert({
          author_id: user.id,
          content: newPost,
          visibility: 'public'
        });

      if (error) throw error;

      toast.success("Publication créée avec succès");
      setNewPost("");
      fetchPublications();
    } catch (error: any) {
      toast.error("Erreur lors de la création de la publication");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const canCreatePost = role === 'company' || role === 'super_admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Fil d'actualité</h1>

        {canCreatePost && (
          <Card className="p-6">
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Textarea
                placeholder="Quoi de neuf ?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={loading || !newPost.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publier
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {publications.map((publication) => (
            <Card key={publication.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(publication.created_at), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-foreground whitespace-pre-wrap">{publication.content}</p>

                {publication.hashtags && publication.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {publication.hashtags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-sm text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    J'aime
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {publications.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucune publication pour le moment</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsfeed;

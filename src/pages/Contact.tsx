import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from 'react';
import { toast } from 'sonner';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) return toast.error('Veuillez remplir tous les champs');
    try {
      setSending(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message }),
      });
      if (!res.ok) throw new Error('Erreur envoi');
      toast.success('Message envoyé, nous vous contacterons bientôt');
      setEmail(''); setSubject(''); setMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Impossible d\'envoyer le message');
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Contact</h1>
            <p className="text-muted-foreground mb-6">Nous contacter — Emploi+ (Brazzaville, République du Congo)</p>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-3">Assistance</h2>
                <p className="text-muted-foreground mb-4">Pour assistance locale, contactez-nous par WhatsApp ou email.</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" />
                    <a href="mailto:contact@emploiplus.cg" className="text-primary">contact@emploiplus.cg</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5" />
                    <a href="https://wa.me/242067311033" target="_blank" rel="noreferrer" className="text-primary">+242 0673 11033</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-1" />
                    <div>
                      <p className="font-medium">Brazzaville, République du Congo</p>
                      <p className="text-sm text-muted-foreground">Nos horaires: Lun-Ven, 9h-17h</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-3">Envoyer un message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input className="w-full border px-3 py-2 rounded" placeholder="Votre email" value={email} onChange={(e)=>setEmail(e.target.value)} type="email" />
                  <input className="w-full border px-3 py-2 rounded" placeholder="Objet" value={subject} onChange={(e)=>setSubject(e.target.value)} />
                  <textarea className="w-full border px-3 py-2 rounded h-32" placeholder="Votre message" value={message} onChange={(e)=>setMessage(e.target.value)} />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={sending}>{sending ? 'Envoi...' : 'Envoyer le message'}</Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

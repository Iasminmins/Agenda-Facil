import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users, MessageSquare, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPaymentLink } from "@/lib/mercadopago";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const benefits = [
  { icon: Calendar, title: "Agenda organizada", desc: "Veja todos seus horários num só lugar, sem confusão." },
  { icon: Clock, title: "Sem conflitos", desc: "O sistema bloqueia horários ocupados automaticamente." },
  { icon: Users, title: "Link para clientes", desc: "Compartilhe um link e seus clientes agendam sozinhos." },
  { icon: MessageSquare, title: "Lembrete via WhatsApp", desc: "Envie lembretes com um toque direto pelo sistema." },
  { icon: Shield, title: "Seus dados seguros", desc: "Tudo protegido na nuvem, acessível de qualquer lugar." },
  { icon: Zap, title: "Rápido e simples", desc: "Feito para quem não tem tempo de aprender sistema complicado." },
];

const Index = () => {
  const [loading, setLoading] = useState<'essencial' | 'profissional' | null>(null);
  const { toast } = useToast();

  const handlePayment = async (plan: 'essencial' | 'profissional') => {
    setLoading(plan);
    try {
      const paymentUrl = await createPaymentLink(plan);
      window.location.href = paymentUrl;
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente em instantes.",
        variant: "destructive"
      });
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">AgendaFácil</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm">Criar minha agenda</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            Pare de perder clientes no WhatsApp
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight">
            Sua agenda profissional,{" "}
            <span className="text-primary">simples e organizada</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Seus clientes agendam online, você aprova e organiza tudo num só lugar. 
            Sem papel, sem confusão, sem perder horário.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/cadastro">
              <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25">
                Criar minha agenda grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
          Tudo que você precisa para organizar seus atendimentos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                <p className="text-muted-foreground text-sm">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
          Planos que cabem no seu bolso
        </h2>
        <p className="text-center text-muted-foreground mb-12">Comece grátis, pague só quando crescer.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="border-border/60 bg-card">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground">Essencial</h3>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-foreground">R$29</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground text-left">
                <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Até 50 agendamentos/mês</li>
                <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Página de agendamento</li>
                <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Lembretes via WhatsApp</li>
              </ul>
              <Button 
                variant="outline" 
                className="mt-8 w-full"
                onClick={() => handlePayment('essencial')}
                disabled={loading !== null}
              >
                {loading === 'essencial' ? 'Carregando...' : 'Começar'}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-foreground">Profissional</h3>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-foreground">R$49</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground text-left">
                <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Agendamentos ilimitados</li>
                <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Página personalizada</li>
                <li className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Lembretes automáticos</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Relatórios de clientes</li>
              </ul>
              <Button 
                className="mt-8 w-full"
                onClick={() => handlePayment('profissional')}
                disabled={loading !== null}
              >
                {loading === 'profissional' ? 'Carregando...' : 'Começar agora'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">AgendaFácil</span>
          </div>
          © 2026 AgendaFácil. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;

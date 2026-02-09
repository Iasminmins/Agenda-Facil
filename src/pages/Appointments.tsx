import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: { name: string } | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground border-accent",
  confirmed: "bg-primary/10 text-primary border-primary",
  cancelled: "bg-destructive/10 text-destructive border-destructive",
  completed: "bg-muted text-muted-foreground border-border",
};

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
      if (profile) {
        setProfileId(profile.id);
        const { data } = await supabase
          .from("appointments")
          .select("id, client_name, client_phone, appointment_date, appointment_time, status, services(name)")
          .eq("professional_id", profile.id)
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false });
        if (data) setAppointments(data as unknown as Appointment[]);
      }
    };
    load();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setAppointments(appointments.map((a) => a.id === id ? { ...a, status } : a));
    toast({ title: `Agendamento ${statusLabels[status].toLowerCase()}!` });
  };

  const sendWhatsApp = (phone: string, clientName: string, date: string, time: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá ${clientName}! 😊 Lembrando do seu agendamento em ${format(new Date(date + "T00:00:00"), "dd/MM", { locale: ptBR })} às ${time.slice(0, 5)}. Confirma presença?`);
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, "_blank");
  };

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" /> Agendamentos
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "cancelled", "completed"].map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
              {s === "all" ? "Todos" : statusLabels[s]}
            </Button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</CardContent></Card>
          )}
          {filtered.map((a) => (
            <Card key={a.id} className="border-border/60">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{a.client_name}</p>
                  <p className="text-sm text-muted-foreground">{a.client_phone}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {a.services?.name} · {format(new Date(a.appointment_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })} às {a.appointment_time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={statusColors[a.status]}>{statusLabels[a.status]}</Badge>
                  {a.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-primary border-primary" onClick={() => updateStatus(a.id, "confirmed")}>
                        <Check className="h-4 w-4" /> Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive border-destructive" onClick={() => updateStatus(a.id, "cancelled")}>
                        <X className="h-4 w-4" /> Recusar
                      </Button>
                    </>
                  )}
                  {a.client_phone && (
                    <Button size="sm" variant="ghost" className="gap-1" onClick={() => sendWhatsApp(a.client_phone, a.client_name, a.appointment_date, a.appointment_time)}>
                      <MessageSquare className="h-4 w-4" /> WhatsApp
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

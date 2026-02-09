import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, isToday, isThisWeek } from "date-fns";
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

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent-foreground border-accent",
  confirmed: "bg-primary/10 text-primary border-primary",
  cancelled: "bg-destructive/10 text-destructive border-destructive",
  completed: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
      if (data) setProfileId(data.id);
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!profileId) return;
    const fetchAppointments = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, client_name, client_phone, appointment_date, appointment_time, status, services(name)")
        .eq("professional_id", profileId)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
        .limit(50);
      if (data) setAppointments(data as unknown as Appointment[]);
    };
    fetchAppointments();
  }, [profileId]);

  const todayCount = appointments.filter((a) => isToday(new Date(a.appointment_date + "T00:00:00"))).length;
  const weekCount = appointments.filter((a) => isThisWeek(new Date(a.appointment_date + "T00:00:00"))).length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const upcoming = appointments.filter(
    (a) => a.status !== "cancelled" && new Date(a.appointment_date + "T00:00:00") >= new Date(new Date().toDateString())
  ).slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Painel</h1>

        {/* Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-foreground">{todayCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Esta semana</p>
                <p className="text-2xl font-bold text-foreground">{weekCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximos atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum agendamento encontrado.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{a.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.services?.name} · {format(new Date(a.appointment_date + "T00:00:00"), "dd/MM", { locale: ptBR })} às {a.appointment_time.slice(0, 5)}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColors[a.status]}>
                      {statusLabels[a.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bus, Plus, Loader2, Trash2, MapPin } from "lucide-react";

type Route = {
  id: string;
  route_name: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  fare_amount: number;
};

export function TransportClient({ initialRoutes }: { initialRoutes: Route[] }) {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [routeName, setRouteName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [fareAmount, setFareAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('routes_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transport_routes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRoutes((prev) => {
            if (prev.find(r => r.id === payload.new.id)) return prev;
            return [payload.new as Route, ...prev];
          });
        }
        if (payload.eventType === 'DELETE') {
          setRoutes((prev) => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim() || !vehicleNumber.trim()) return;
    
    setLoading(true);

    const fare = parseFloat(fareAmount);
    const payload = { 
      route_name: routeName.trim(),
      vehicle_number: vehicleNumber.trim(),
      driver_name: driverName.trim(),
      driver_phone: driverPhone.trim(),
      fare_amount: isNaN(fare) ? 0 : fare
    };

    const { error } = await supabase.from('transport_routes').insert([payload]);
    
    if (error) {
      alert("Error adding route: " + error.message);
    } else {
      setRouteName("");
      setVehicleNumber("");
      setDriverName("");
      setDriverPhone("");
      setFareAmount("");
    }
    setLoading(false);
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    
    const previous = [...routes];
    setRoutes(routes.filter(r => r.id !== id));

    const { error } = await supabase.from('transport_routes').delete().eq('id', id);
    if (error) {
      setRoutes(previous);
      alert("Error deleting route: " + error.message);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6">
        <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-foreground">Welcome, Transport Mgr</span>
            <span className="text-xs text-muted-foreground">Admin Role</span>
          </div>
          <Avatar className="h-9 w-9 border border-border shadow-sm cursor-pointer hover:opacity-80 transition">
            <AvatarImage src="/admin_avatar.png" />
            <AvatarFallback>TM</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Bus className="h-8 w-8 text-primary" />
              Transport Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage vehicles, routes, and drivers.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-border shadow-sm h-fit flex flex-col bg-card">
            <CardHeader className="bg-muted/50 border-b border-border shrink-0">
              <CardTitle>Add New Route</CardTitle>
              <CardDescription>Register a vehicle and its route.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddRoute} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="routeName">Route Name *</Label>
                  <Input 
                    id="routeName" 
                    required
                    placeholder="e.g. Route A - City Center" 
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input 
                    id="vehicleNumber" 
                    required
                    placeholder="e.g. ABC-1234" 
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name</Label>
                  <Input 
                    id="driverName" 
                    placeholder="e.g. Ali Khan" 
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Driver Phone</Label>
                  <Input 
                    id="driverPhone" 
                    placeholder="e.g. 0300-1234567" 
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fareAmount">Monthly Fare Amount (Rs) *</Label>
                  <Input 
                    id="fareAmount" 
                    type="number"
                    required
                    placeholder="e.g. 3000" 
                    value={fareAmount}
                    onChange={(e) => setFareAmount(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading || !routeName.trim() || !vehicleNumber.trim() || !fareAmount.trim()}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Add Route</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border shadow-sm overflow-hidden bg-card h-fit">
            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Routes</CardTitle>
                <CardDescription>List of all transport routes.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {routes.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No routes found.</p>
                  <p className="text-sm">Add a route using the form to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Route Info</TableHead>
                        <TableHead>Vehicle & Driver</TableHead>
                        <TableHead>Fare</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <TableRow key={route.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell className="pl-4">
                            <p className="font-semibold text-foreground">{route.route_name}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{route.vehicle_number}</span>
                              <span className="text-xs text-muted-foreground">{route.driver_name} • {route.driver_phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600 dark:text-green-500">
                              Rs. {route.fare_amount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                              onClick={() => handleDeleteRoute(route.id)}
                              title="Delete Route"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

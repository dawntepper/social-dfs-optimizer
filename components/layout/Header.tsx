'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dumbbell, LineChart, Bell, Settings2, CreditCard, Shield, Layers, FileUp, Cloud } from 'lucide-react';
import { useAlerts } from '@/components/alerts/AlertsProvider';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const { alerts } = useAlerts();

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const highAlerts = alerts.filter(a => a.severity === 'HIGH');

  const getAlertColor = () => {
    if (criticalAlerts.length > 0) return "text-red-500 drop-shadow-glow-red";
    if (highAlerts.length > 0) return "text-orange-500 drop-shadow-glow-orange";
    if (alerts.length > 0) return "text-yellow-500 drop-shadow-glow-yellow";
    return "text-foreground/60";
  };

  const navigation = [
    { name: 'Optimizer', href: '/optimizer', icon: Dumbbell },
    { name: 'Analyze Lineups', href: '/analyze-lineups', icon: FileUp },
    { name: 'Stacks', href: '/stacks', icon: Layers },
    { name: 'Analysis', href: '/analysis', icon: LineChart },
    { 
      name: 'Weather', 
      href: '/weather', 
      icon: Cloud,
      dropdown: [
        { name: 'Overview', href: '/weather' },
        { name: 'NFL Weather', href: '/weather/nfl' },
        { name: 'MLB Weather', href: '/weather/mlb' },
      ]
    },
    { 
      name: 'Alerts', 
      href: '/alerts', 
      icon: Bell,
      badge: alerts.length > 0 ? alerts.length : null,
      badgeColor: getAlertColor()
    },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings2 },
    { name: 'Admin', href: '/admin', icon: Shield },
  ];

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <span className="text-xl font-bold">NFL DFS Optimizer</span>
        </Link>
        <nav className="flex items-center space-x-8 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon;
            if (item.dropdown) {
              return (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Icon className={cn("mr-2 h-4 w-4", item.badgeColor)} />
                      {item.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {item.dropdown.map((dropdownItem) => (
                      <DropdownMenuItem key={dropdownItem.href} asChild>
                        <Link href={dropdownItem.href}>
                          {dropdownItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href ? "text-foreground" : "text-foreground/60"
                )}
              >
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start relative"
                >
                  <Icon className={cn("mr-2 h-4 w-4", item.badgeColor)} />
                  {item.name}
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
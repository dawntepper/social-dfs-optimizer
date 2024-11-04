import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  children: React.ReactNode;
}

export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export interface BreadcrumbItemProps extends React.ComponentPropsWithoutRef<'li'> {
  children: React.ReactNode;
}

export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
    </li>
  );
}

export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  children: React.ReactNode;
  href: string;
}

export function BreadcrumbLink({ className, href, ...props }: BreadcrumbLinkProps) {
  return (
    <Link
      href={href}
      className={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
}
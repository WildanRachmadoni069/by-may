"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, HelpCircle, Info } from "lucide-react";

export default function SEODashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">SEO Settings</h1>
        <p className="text-muted-foreground">
          Manage SEO settings for static pages of your website
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Home Page SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Homepage
            </CardTitle>
            <CardDescription>
              Configure SEO settings for your website's homepage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Set title, meta description, and optimize for search engines to
              improve your homepage visibility.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo/home" className="w-full">
              <Button className="w-full">Edit Homepage SEO</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* FAQ Page SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ Page
            </CardTitle>
            <CardDescription>
              Configure SEO settings for your FAQ page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Optimize your FAQ page to help customers find answers to common
              questions through search engines.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo/faq" className="w-full">
              <Button className="w-full">Edit FAQ Page SEO</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* About Us Page SEO Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About Us
            </CardTitle>
            <CardDescription>
              Configure SEO settings for your About Us page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Optimize your About Us page to help customers learn about your
              business through search engines.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/admin/seo/about" className="w-full">
              <Button className="w-full">Edit About Us SEO</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

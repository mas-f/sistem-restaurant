"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/action"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-5 text-center">
          <BrandLogo className="h-12" />
          <div>
            <h1 className="font-heading text-2xl font-extrabold">Masuk</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Selamat datang kembali di RestoFlow.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
          action={formAction}
        >
          {state.error ? (
            <Alert variant="destructive" className="px-3 py-2.5 text-xs">
              <CircleAlert />
              <AlertDescription className="text-xs font-medium">
                {state.error}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              className="h-10 rounded-lg"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold">
              Kata Sandi
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="h-10 rounded-lg"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full text-sm font-bold cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}

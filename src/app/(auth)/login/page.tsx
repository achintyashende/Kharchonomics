import Link from 'next/link';
import { login } from '../actions';
import { Banknote } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const error = params.error as string | undefined;

  return (
    <section className="min-h-[100svh] flex flex-col items-center justify-center px-6 pb-6 pt-[calc(24px+env(safe-area-inset-top))] bg-bg">
      <form className="w-full max-w-[420px] p-7 px-5 border-2 border-line rounded-lg bg-panel shadow-app" action={login}>
        <h1 className="m-0 mb-1.5 font-sans uppercase text-[32px] font-black tracking-wide text-text flex items-center justify-center gap-3">
          Kaash
        </h1>
        <p className="m-0 mb-6 text-muted text-center leading-relaxed">
          Sign in with your email and password.
        </p>
        
        <label className="grid gap-2 mb-4 text-muted font-bold">
          Email
          <input 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            className="w-full min-h-[48px] p-2.5 px-3.5 border-2 border-line rounded-lg bg-panel-soft text-text outline-none" 
          />
        </label>
        
        <label className="grid gap-2 mb-4 text-muted font-bold">
          Password
          <input 
            name="password" 
            type="password" 
            autoComplete="current-password" 
            minLength={6} 
            required 
            className="w-full min-h-[48px] p-2.5 px-3.5 border-2 border-line rounded-lg bg-panel-soft text-text outline-none" 
          />
        </label>
        
        <p className="min-h-[24px] text-expense font-bold">
          {error}
        </p>
        
        <div className="grid gap-3">
          <button 
            className="min-h-[48px] p-2.5 px-4 rounded-lg font-bold uppercase border-none bg-text text-bg" 
            type="submit"
          >
            Login
          </button>
          
          <Link 
            href="/signup" 
            className="border-none bg-transparent text-text font-bold text-center block w-full py-2"
          >
            Create a new account
          </Link>
        </div>
      </form>
    </section>
  );
}

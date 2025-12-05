import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { errorMessages } from '@/lib/messages';
import { validateSession } from '@/services/server/auth';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SignupForm from '../login/_components/signup-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Walletize',
  description: 'Create an account to start using Walletize.',
};

async function SignupPage({ searchParams }: { searchParams: { error: string | undefined } }) {
  const user = await validateSession();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-full w-full justify-center">
      <div className="mx-auto my-auto flex w-full max-w-lg flex-col items-center gap-8 py-12">
        <div className="flex items-center gap-2 font-semibold">
          <div className="w-16">
            <Image
              src="/walletize.svg"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: 'auto' }}
              alt="Walletize Logo"
            />
          </div>
          <span className="ml-1 text-4xl font-bold">Walletize</span>
        </div>
        <div className="flex w-full flex-1 flex-col justify-center gap-2 px-4 animate-in">
          <Card className="mx-auto w-full">
            <CardHeader>
              <CardTitle className="text-xl">Sign up</CardTitle>
              <CardDescription>
                Already have an account?{' '}
                <Link href="/login" className="h-fit leading-none">
                  <Button variant="link" className="h-fit p-0 leading-none">
                    Log in
                  </Button>
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {searchParams.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {errorMessages.get(searchParams.error) || errorMessages.get('default')}
                  </AlertDescription>
                </Alert>
              )}
              <SignupForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;

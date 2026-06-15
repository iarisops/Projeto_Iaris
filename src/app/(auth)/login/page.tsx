import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/Logo-IARIS.png"
            alt="IARIS"
            width={140}
            height={40}
            priority
          />
        </div>
        <div className="bg-surface border border-border p-8">
          <h1 className="font-headline text-xl font-semibold text-text-primary mb-6">
            Acesso
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

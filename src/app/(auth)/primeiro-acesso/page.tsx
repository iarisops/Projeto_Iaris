import Image from 'next/image'
import ChangePasswordForm from './ChangePasswordForm'

export default function PrimeiroAcessoPage() {
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
          <h1 className="font-headline text-xl font-semibold text-text-primary mb-2">
            Defina sua senha
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Este é seu primeiro acesso. Escolha uma senha para continuar.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}

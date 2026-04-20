import { cn, getInitials } from '@/lib/utils'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn(
      'relative rounded-full overflow-hidden flex items-center justify-center flex-shrink-0',
      'bg-gradient-to-br from-[#7c3aff] to-[#ff3a8c]',
      sizes[size],
      className
    )}>
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        <span className="font-bold text-white">{getInitials(name)}</span>
      )}
    </div>
  )
}

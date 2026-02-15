import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string | ReactNode;
    children?: ReactNode;
    className?: string;
    backgroundImage?: string;
}

const PageHeader = ({ title, subtitle, children, className, backgroundImage }: PageHeaderProps) => {
    return (
        <section className={cn("relative overflow-hidden bg-mesh min-h-[300px] flex items-center justify-center pt-24 pb-16 md:pt-32 md:pb-24", className)}>
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/10 z-0" />

            {/* Abstract Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 z-0 mix-blend-overlay"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
            )}

            <div className="container-custom relative z-10 px-4 text-center">
                <h1 className="text-3xl sm:text-2xl md:text-2xl lg:text-5xl font-extrabold text-white mb-6 leading-tight animate-slide-up text-glow">
                    {title}
                </h1>

                {subtitle && (
                    <div className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto px-2 animate-slide-up animate-delay-100 font-medium leading-relaxed">
                        {subtitle}
                    </div>
                )}

                {children && (
                    <div className="animate-slide-up animate-delay-200">
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PageHeader;

'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../atoms/Button';
import { PiArrowLeft } from 'react-icons/pi';
import { Typography } from '../../atoms/Typography';
import { MobileBreadcrumProps } from './MobileBreadcrum.type';
import { useTranslation } from '@/hooks/useTranslation';

const MobileBreadcrum: React.FC<MobileBreadcrumProps> = ({ title, className }) => {

    const { t } = useTranslation();
    const router = useRouter();
    const isProperties = title === t("properties");

    return (
        <div className={`bg-white border-b py-3 md:hidden ${className}`}>
            <div className="container">
                <div className="flex items-center gap-4 justify-baseline">
                    {
                        !isProperties &&
                        <Button variant='text' className="p-0! min-w-fit! h-auto! shrink-0 border-0 hover:bg-transparent focus:ring-0" onClick={() => router.back()}>
                            <PiArrowLeft className='text-2xl' />
                        </Button>
                    }
                    <Typography variant='h1' weight='semibold' className='text-base!'>{title}</Typography>
                </div>
            </div>

        </div>
    );
};

export default MobileBreadcrum;

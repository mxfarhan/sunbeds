'use client'
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PiInfo, PiList, PiPhone, PiQuestion } from 'react-icons/pi'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { currentLangCodeSelector } from '@/redux/reducers/languageSlice'

const MenusDropdown = () => {
    const { t } = useTranslation();
    const langCode = useSelector(currentLangCodeSelector);
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className='border-black rounded-full text-black'>
                        <PiList size={24} color='#000' />
                        <span>{t('more')}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='!shadow-md !rounded-t-none rounded-2xl absolute top-8 -right-12 border-t-0'>
                    <DropdownMenuGroup className='py-2'>
                        <DropdownMenuLabel className='font-semibold'>{t('support')}</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup className='p-4 flex flex-col gap-4'>
                        <DropdownMenuItem>
                            <Link href={`/${langCode}/help-support`} className='flexCenter gap-2 text-base'>
                                <PiQuestion size={24} color='#000' />
                                <span>{t('helpSupport')}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={`/${langCode}/about-us`} className='flexCenter gap-2 text-base'>
                                <PiInfo size={24} color='#000' />
                                <span>{t('aboutUs')}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href={`/${langCode}/contact`} className='flexCenter gap-2 text-base'>
                                <PiPhone size={24} color='#000' />
                                <span>{t('contactUs')}</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default MenusDropdown

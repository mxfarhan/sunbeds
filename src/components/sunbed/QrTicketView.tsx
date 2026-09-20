'use client';

import { Typography } from '@/components/storyBook/atoms/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { useSunbedTicket } from '@/hooks/queries/useSunbedBooking';
import { Skeleton } from '@/components/ui/skeleton';
import { formateDatePretty } from '@/utils/helpers';
import { PiCheckCircleFill } from 'react-icons/pi';

interface QrTicketViewProps {
  bookingNumber: string;
}

const QrTicketView = ({ bookingNumber }: QrTicketViewProps) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useSunbedTicket(bookingNumber);

  if (isLoading) {
    return <Skeleton className="w-full h-48 rounded-2xl" />;
  }

  if (isError || !data?.data) {
    return null;
  }

  const ticket = data.data;
  const qrUrl = ticket.qr_token
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticket.qr_token)}`
    : null;

  return (
    <div className="rounded-2xl border p-4 lg:p-6 space-y-4 bg-white">
      <div className="flex items-center gap-2">
        <PiCheckCircleFill className="text-2xl successColor" />
        <Typography variant="h5" weight="semibold" className="textPrimaryColor!">
          {t('yourTicket') || 'Your ticket'}
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {qrUrl && (
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Booking QR code" className="w-[220px] h-[220px] rounded-xl border" />
            <Typography variant="caption" className="textSecondaryColor! text-center">
              {t('scanAtResort') || 'Show this QR code at the resort entrance'}
            </Typography>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Typography variant="caption" className="textSecondaryColor!">{t('bookingDate') || 'Booking date'}</Typography>
            <Typography variant="desc2" weight="semibold" className="textPrimaryColor!">
              {formateDatePretty(ticket.booking_date)}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="textSecondaryColor!">{t('sunbeds') || 'Sunbeds'}</Typography>
            <Typography variant="desc2" weight="semibold" className="textPrimaryColor!">
              {ticket.sunbeds.join(', ')}
            </Typography>
          </div>
          {ticket.checked_in_at && (
            <div>
              <Typography variant="caption" className="textSecondaryColor!">{t('checkedIn') || 'Checked in'}</Typography>
              <Typography variant="desc2" weight="semibold" className="successColor!">
                {new Date(ticket.checked_in_at).toLocaleString()}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrTicketView;

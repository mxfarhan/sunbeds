'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Image, { StaticImageData } from 'next/image';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/storyBook/atoms/Button';
import { Typography } from '@/components/storyBook/atoms/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { PiCalendarDots, PiCheckCircleFill } from 'react-icons/pi';
import { formateDateForApi } from '@/utils/helpers';
import { ResortDetails, ResortSlot } from '@/hooks/queries/useResortDetails';
import { useSunbedLayout, LayoutSunbed } from '@/hooks/queries/useSunbedLayout';
import { useSunbedLock, useSunbedQuote, useSunbedBookingWithPayment } from '@/hooks/queries/useSunbedBooking';
import SlotSelector from './SlotSelector';
import SunbedSelectModal from './SunbedSelectModal';
import { toast } from '@/lib/toast';
import { useDispatch, useSelector } from 'react-redux';
import { isLoginSelector, userDataSelector } from '@/redux/reducers/userSlice';
import { setLoginModalState } from '@/redux/reducers/helpersReducer';
import { formatPriceHelper } from '@/utils/helpers';
import Input from '@/components/storyBook/atoms/Input/Input';
import { useSearchParams } from 'next/navigation';
import flutterwave from '@/assets/images/flutterwave.png';
import stripe from '@/assets/images/stripe.png';
import razorpay from '@/assets/images/razorpay.png';

type PaymentGateway = 'razorpay' | 'stripe' | 'flutterwave';

interface SunbedBookingPanelProps {
  resort: ResortDetails;
}

const allGateways: { id: PaymentGateway; name: string; logo: StaticImageData }[] = [
  { id: 'flutterwave', name: 'Flutterwave', logo: flutterwave },
  { id: 'stripe', name: 'Stripe', logo: stripe },
  { id: 'razorpay', name: 'Razorpay', logo: razorpay },
];

const SunbedBookingPanel = ({ resort }: SunbedBookingPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const isLogin = useSelector(isLoginSelector);
  const userData = useSelector(userDataSelector);

  const dateParam = searchParams.get('date');
  const initialDate = dateParam ? new Date(dateParam) : new Date();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(resort.slots[0]?.id ?? null);
  const [draftSunbeds, setDraftSunbeds] = useState<LayoutSunbed[]>([]);
  const [confirmedSunbeds, setConfirmedSunbeds] = useState<LayoutSunbed[]>([]);
  const [selectionConfirmed, setSelectionConfirmed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [lockGroup, setLockGroup] = useState<string | null>(null);
  const [guestName, setGuestName] = useState(userData?.name ?? '');
  const [guestEmail, setGuestEmail] = useState(userData?.email ?? '');
  const [guestPhone, setGuestPhone] = useState(userData?.phone ?? '');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [availableGateways, setAvailableGateways] = useState<string[]>([]);
  const [quoteTotalAmount, setQuoteTotalAmount] = useState<number | null>(null);
  const [pendingBookingNumber, setPendingBookingNumber] = useState<string | null>(null);
  const [paymentErrorHint, setPaymentErrorHint] = useState<string | null>(null);

  const dateStr = formateDateForApi(selectedDate);

  const { data: layoutData, isLoading: layoutLoading, refetch: refetchLayout } = useSunbedLayout(
    { slug: resort.slug, date: dateStr, slot_id: selectedSlotId! },
    !!selectedSlotId
  );

  const quoteMutation = useSunbedQuote();
  const lockMutation = useSunbedLock();
  const paymentMutation = useSunbedBookingWithPayment();

  const gateways = allGateways.filter(
    (gw) => availableGateways.length === 0 || availableGateways.includes(gw.id)
  );

  useEffect(() => {
    setDraftSunbeds([]);
    setConfirmedSunbeds([]);
    setSelectionConfirmed(false);
    setShowGuestForm(false);
    setLockGroup(null);
    setSelectedGateway(null);
    setAvailableGateways([]);
    setQuoteTotalAmount(null);
    setPendingBookingNumber(null);
    setPaymentErrorHint(null);
  }, [selectedDate, selectedSlotId]);

  useEffect(() => {
    if (userData?.name) setGuestName(userData.name);
    if (userData?.email) setGuestEmail(userData.email);
    if (userData?.phone) setGuestPhone(userData.phone);
  }, [userData]);

  const handleToggleSunbed = (sunbed: LayoutSunbed) => {
    setDraftSunbeds((prev) => {
      const exists = prev.find((s) => s.id === sunbed.id);
      if (exists) return prev.filter((s) => s.id !== sunbed.id);
      return [...prev, sunbed];
    });
  };

  const handleConfirmSelection = () => {
    if (draftSunbeds.length === 0) {
      toast.error(t('selectSunbeds') || 'Please select at least one sunbed');
      return;
    }
    setConfirmedSunbeds([...draftSunbeds]);
    setSelectionConfirmed(true);
    setModalOpen(false);
  };

  const handleOpenModal = () => {
    setDraftSunbeds([...confirmedSunbeds]);
    setModalOpen(true);
  };

  const handleReserve = async () => {
    if (!selectedSlotId || confirmedSunbeds.length === 0 || !selectionConfirmed) {
      toast.error(t('selectSunbeds') || 'Please select and confirm your sunbeds first');
      return;
    }

    if (!isLogin) {
      toast.error(t('loginFirst') || 'Please login first');
      dispatch(setLoginModalState(true));
      return;
    }

    const payload = {
      property_id: resort.id,
      sunbed_slot_id: selectedSlotId,
      booking_date: dateStr,
      sunbed_ids: confirmedSunbeds.map((s) => s.id),
    };

    try {
      const quoteRes = await quoteMutation.mutateAsync(payload);
      setQuoteTotalAmount(quoteRes.data.pricing.total_amount);
      setAvailableGateways(quoteRes.data.payment?.available_gateways ?? []);
      const lockRes = await lockMutation.mutateAsync(payload);
      setLockGroup(lockRes.data.lock_group);
      setShowGuestForm(true);
      setPendingBookingNumber(null);
      setPaymentErrorHint(null);
      toast.success(t('sunbedsLocked') || 'Sunbeds reserved temporarily');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Booking failed';
      toast.error(message);
      refetchLayout();
    }
  };

  const handlePayAndConfirm = async () => {
    if (!lockGroup || !guestName || !guestEmail) {
      toast.error(t('fillGuestDetails') || 'Please fill guest details');
      return;
    }

    if (!selectedGateway) {
      toast.error(t('selectPaymentMethod') || 'Please select a payment method');
      return;
    }

    if (gateways.length === 0) {
      toast.error(t('paymentNotConfigured') || 'Online payment is not configured for this resort yet.');
      return;
    }

    try {
      setPaymentErrorHint(null);
      const res = await paymentMutation.mutateAsync({
        lock_group: lockGroup,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone || undefined,
        gateway_type: selectedGateway,
        payment_type: 'full',
      });

      const paymentUrl = res?.data?.payment?.payment_url;
      const bookingNumber = res?.data?.booking?.booking_number;

      if (paymentUrl) {
        sessionStorage.setItem('sunbedPendingBooking', bookingNumber ?? '');
        window.location.href = paymentUrl;
        return;
      }

      toast.error(t('bookingFail') || 'Could not start payment. Please try again.');
    } catch (err: unknown) {
      const error = err as Error & { bookingData?: { booking?: { booking_number?: string } }; gatewayError?: string };
      const bookingNumber = error.bookingData?.booking?.booking_number;
      if (bookingNumber) {
        setPendingBookingNumber(bookingNumber);
      }
      const hint = error.gatewayError
        ? `${error.message} ${error.gatewayError.includes('Invalid API Key') ? 'Please ask the admin to configure a valid Stripe key.' : ''}`
        : error.message;
      setPaymentErrorHint(hint);
      toast.error(hint || t('bookingFail') || 'Payment failed');
    }
  };

  const selectionTotal = confirmedSunbeds.reduce((sum, s) => sum + s.price, 0);
  const displayTotal = quoteTotalAmount ?? selectionTotal;
  const areas = layoutData?.data?.areas ?? [];

  return (
    <>
      <div className="bg-white rounded-2xl border p-4 lg:p-6 space-y-6">
        <Typography variant="h5" weight="semibold" className="textPrimaryColor!">
          {t('bookSunbeds') || 'Book Sunbeds'}
        </Typography>

        <div className="space-y-2">
          <Typography variant="caption" className="textSecondaryColor!">{t('selectDate') || 'Select date'}</Typography>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2" leftIcon={<PiCalendarDots className="text-xl" />}>
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    setCalendarOpen(false);
                  }
                }}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Typography variant="caption" className="textSecondaryColor!">{t('selectSlot') || 'Select time slot'}</Typography>
          <SlotSelector
            slots={resort.slots as ResortSlot[]}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
          />
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleOpenModal}
          disabled={!selectedSlotId || layoutLoading}
        >
          {selectionConfirmed
            ? (t('changeSunbeds') || 'Change sunbeds')
            : (t('selectSunbeds') || 'Select sunbeds')}
        </Button>

        {selectionConfirmed && confirmedSunbeds.length > 0 && (
          <div className="space-y-2 p-3 rounded-xl bodyBg">
            <Typography variant="desc2" weight="medium" className="textPrimaryColor!">
              {confirmedSunbeds.length} {t('sunbedsSelected') || 'sunbed(s) selected'}
            </Typography>
            <Typography variant="desc2" className="textSecondaryColor!">
              {confirmedSunbeds.map((s) => s.code).join(', ')}
            </Typography>
            <Typography variant="h6" weight="semibold" className="textPrimaryColor!">
              {resort.currency_symbol}{formatPriceHelper(displayTotal)} {quoteTotalAmount ? '' : `+ ${t('taxesAndFees') || 'taxes'}`}
            </Typography>
          </div>
        )}

        {!showGuestForm ? (
          <Button
            variant="primary"
            className="w-full"
            onClick={handleReserve}
            loading={quoteMutation.isPending || lockMutation.isPending}
            disabled={!selectionConfirmed || confirmedSunbeds.length === 0}
          >
            {t('reserveNow') || 'Reserve Now'}
          </Button>
        ) : (
          <div className="space-y-4 border-t pt-4">
            <Typography variant="h6" weight="semibold" className="textPrimaryColor!">
              {t('guestDetails') || 'Guest details'}
            </Typography>
            <Input label={t('fullName') || 'Full name'} value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            <Input label={t('email') || 'Email'} type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
            <Input label={t('phoneNumber') || 'Phone'} value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />

            <div className="space-y-3">
              <Typography variant="desc2" weight="semibold" className="textPrimaryColor!">
                {t('selectPaymentMethod') || 'Choose payment method'}
              </Typography>
              {gateways.length === 0 ? (
                <Typography variant="caption" className="textSecondaryColor!">
                  {t('paymentNotConfigured') || 'Online payment is not configured for this resort yet.'}
                </Typography>
              ) : (
              <div className="grid grid-cols-1 gap-3">
                {gateways.map((gw) => {
                  const isSelected = selectedGateway === gw.id;
                  return (
                    <div
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'primaryBorderColor primaryLightBg' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Image src={gw.logo} alt={gw.name} width={28} height={28} className="object-contain" />
                        <Typography variant="caption" weight="semibold" className="textPrimaryColor!">{gw.name}</Typography>
                      </div>
                      {isSelected
                        ? <PiCheckCircleFill className="text-xl primaryColor!" />
                        : <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />}
                    </div>
                  );
                })}
              </div>
              )}
              {paymentErrorHint && (
                <Typography variant="caption" className="errorColor!">
                  {paymentErrorHint} {pendingBookingNumber ? (t('retryPaymentHint') || 'You can retry payment without reserving again.') : ''}
                </Typography>
              )}
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handlePayAndConfirm}
              loading={paymentMutation.isPending}
              disabled={gateways.length === 0}
            >
              {pendingBookingNumber ? (t('retryPayment') || 'Retry payment') : (t('payAndConfirm') || 'Pay & confirm booking')}
            </Button>
          </div>
        )}
      </div>

      <SunbedSelectModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        areas={areas}
        layoutData={layoutData?.data}
        selectedSunbeds={draftSunbeds}
        onToggleSunbed={handleToggleSunbed}
        onConfirm={handleConfirmSelection}
        loading={layoutLoading}
        currencySymbol={resort.currency_symbol}
      />
    </>
  );
};

export default SunbedBookingPanel;

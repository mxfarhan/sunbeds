/** Shared carousel slide widths for resort cards (+24px vs original fractions). */
export const RESORT_CARD_CAROUSEL_DESKTOP =
  'pl-4 basis-full sm:basis-[calc(50%+24px)] lg:basis-[calc(33.333%+24px)] xl:basis-[calc(25%+24px)]';

export const RESORT_CARD_CAROUSEL_MOBILE = 'pl-4 basis-[calc(70%+24px)]';

/** Grid that keeps cards ~24px wider than a tight 4-col layout. */
export const RESORT_CARD_GRID =
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 xl:grid-cols-[repeat(auto-fill,minmax(274px,1fr))]';

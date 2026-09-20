export interface SliderMedia {
    src: string;
    media_type?: string;
}

export interface RoomImgsSliderProps {
    images: SliderMedia[];
    className?: string;
    imageClassName?: string;
    roomsDetailsPage?: boolean;
}

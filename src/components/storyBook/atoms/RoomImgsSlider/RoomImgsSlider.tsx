'use client';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState, MouseEvent } from "react";
import { RoomImgsSliderProps } from "./RoomImgsSlider.type";
import ImagePreview from "@/components/storyBook/atoms/ImagePreview";
import LightBox from "@/components/lightBox/LightBox";
import { PiPlay } from "react-icons/pi";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

const RoomImgsSlider = ({ images, className, imageClassName, roomsDetailsPage = false }: RoomImgsSliderProps) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    if (!images || images.length === 0) return null;

    const onDotClick = (e: MouseEvent<HTMLButtonElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        api?.scrollTo(index);
    };

    return (
        <>
            <Carousel className={`relative w-full group ${className || ''}`} setApi={setApi}>
                <CarouselContent>
                    {images.map((img, index) => (
                        <CarouselItem key={index} className="relative cursor-pointer" onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}>
                            {img.media_type === 'video' ? (
                                <div className={`relative w-full ${imageClassName || ''}`}>
                                    <video
                                        src={`${resolveMediaUrl(img.src)}#t=0.1`}
                                        className="w-full h-full object-cover"
                                        preload="metadata"                                        
                                        playsInline
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                            <PiPlay className="text-xl text-black" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <ImagePreview
                                    src={img.src}
                                    alt={`Room image ${index + 1}`}
                                    className={`w-full h-full object-cover ${imageClassName || ''}`}
                                />
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Pagination Dots - Positioned over the image at the bottom, exact styles from Slider.tsx */}
                <div className="py-4 flexCenter gap-1 lg:hidden absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => onDotClick(e, index)}
                            className={`h-2 rounded-full transition-all duration-300 pointer-events-auto shadow-sm ${current === index
                                ? `w-6 ${roomsDetailsPage ? 'bg-white' : 'primaryBg'}`
                                : 'w-2 bg-[var(--neutral-300)]'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </Carousel>

            <LightBox
                images={images.map((img, i) => ({ src: resolveMediaUrl(img.src), alt: `Room image ${i + 1}`, media_type: img.media_type }))}
                isOpen={lightboxOpen}
                currentIndex={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
                onIndexChange={setLightboxIndex}
            />
        </>
    );
};

export default RoomImgsSlider;

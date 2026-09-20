"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import ImagePlaceholder from "@/assets/images/logo.png";

import { ImagePreviewProps } from "./ImagePreview.type";
import { useSelector } from "react-redux";
import { settingsSelector } from "@/redux/reducers/settingsSlice";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

// Size preset classes
const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
    "2xl": "w-64 h-64",
};

// Aspect ratio classes
const aspectRatioClasses = {
    square: "aspect-square",
    "4/3": "aspect-[4/3]",
    "16/9": "aspect-video",
    "3/2": "aspect-[3/2]",
    "2/1": "aspect-[2/1]",
    auto: "",
};

// Rounded classes
const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    '2xl': "rounded-2xl",
    full: "rounded-full",
};

// Border color classes
const borderColorClasses = {
    gray: "border-gray-300",
    primary: "border-primary-300",
    secondary: "border-gray-400",
    success: "border-green-300",
    warning: "border-yellow-300",
    error: "border-red-300",
};

// Shadow classes
const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
};

// Object fit classes
const objectFitClasses = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
};

const ImagePreview: React.FC<ImagePreviewProps> = ({
    src,
    alt,
    size,
    aspectRatio = "auto",
    rounded = "none",
    bordered = false,
    borderColor = "gray",
    shadow = "none",
    objectFit = "cover",
    fadeInDuration = 300,
    className = "",
    containerClassName = "",
    onLoad,
    onError,
    loading = "lazy",
}) => {

    const settingsData = useSelector(settingsSelector);
    const placeholderSrc = useMemo(
        () => resolveMediaUrl(settingsData?.branding?.default_img) || ImagePlaceholder.src,
        [settingsData?.branding?.default_img]
    );

    const resolvedSrc = useMemo(() => {
        const raw =
            typeof src === "object" && src?.src
                ? src.src
                : typeof src === "string"
                    ? src
                    : null;
        return raw ? resolveMediaUrl(raw) : null;
    }, [src]);

    const [imageSrc, setImageSrc] = useState<string>(ImagePlaceholder.src);
    const [isLoaded, setIsLoaded] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!resolvedSrc) {
            setImageSrc(placeholderSrc);
            setIsLoaded(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsLoaded(false);
        setImageSrc(resolvedSrc);
    }, [resolvedSrc]);

    useEffect(() => {
        if (!resolvedSrc) {
            setImageSrc(placeholderSrc);
        }
    }, [placeholderSrc, resolvedSrc]);

    useEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth > 0) {
            setIsLoaded(true);
            setIsLoading(false);
        }
    }, [imageSrc]);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>): void => {
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.(event);
    };

    const handleError = (
        event: React.SyntheticEvent<HTMLImageElement>
    ): void => {
        setIsLoading(false);
        setIsLoaded(true);
        if (imageSrc !== placeholderSrc) {
            setImageSrc(placeholderSrc);
        }
        onError?.(event);
    };

    const imageClasses = [
        "w-full h-full",
        objectFitClasses[objectFit],
        roundedClasses[rounded],
        bordered ? `border ${borderColorClasses[borderColor]}` : "",
        shadowClasses[shadow],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const containerClasses = [
        "relative flexCenter",
        size ? sizeClasses[size] : "w-full h-full",
        aspectRatioClasses[aspectRatio],
        containerClassName,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={containerClasses}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10 rounded-inherit">
                    <img
                        src={placeholderSrc}
                        alt="loading"
                        className="w-full h-full object-contain animate-pulse"
                    />
                </div>
            )}

            <img
                ref={imgRef}
                src={imageSrc || placeholderSrc}
                alt={alt}
                className={imageClasses}
                style={{
                    opacity: isLoaded ? 1 : 0,
                    transition: `opacity ${fadeInDuration}ms ease-in-out`,
                }}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
};

export default ImagePreview;

"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Keyboard } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faDownload, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import type { HeroSlideItem } from "../../types/content";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Props = {
  slides: HeroSlideItem[];
};

export default function HeroSlider({ slides }: Props) {
  if (!slides.length) return null;

  return (
    <section className="hero" aria-label="Destaques">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, Keyboard]}
        spaceBetween={0}
        slidesPerView={1}
        loop={slides.length > 1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        keyboard={{ enabled: true }}
        navigation
        pagination={{ clickable: true }}
        a11y={{ enabled: true }}
      >
        {slides.map((slide) => {
          const href =
            slide.type === "movie"
              ? `/filmes/${slide.slug}`
              : `/series/${slide.slug}`;
          return (
            <SwiperSlide key={`${slide.type}-${slide.id}`}>
              <div className="hero-slide">
                <div className="hero-slide__backdrop">
                  {slide.backdrop ? (
                    <Image
                      src={slide.backdrop}
                      alt={slide.title}
                      fill
                      sizes="100vw"
                      priority
                    />
                  ) : null}
                </div>
                <div className="container hero-slide__content">
                  <div className="hero-slide__poster">
                    {slide.poster ? (
                      <Image
                        src={slide.poster}
                        alt={slide.title}
                        width={220}
                        height={330}
                      />
                    ) : null}
                  </div>
                  <div className="hero-slide__info">
                    <h2>{slide.title}</h2>
                    <div className="hero-slide__meta">
                      {slide.year ? <span>{slide.year}</span> : null}
                      {slide.genres.map((g) => (
                        <span key={g} className="pill">
                          {g}
                        </span>
                      ))}
                    </div>
                    {slide.overview ? (
                      <p className="hero-slide__overview">{slide.overview}</p>
                    ) : null}
                    <div className="hero-slide__buttons">
                      <Link href={href} className="btn btn--primary">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Ver detalhes
                      </Link>
                      {slide.hasDownload ? (
                        <Link
                          href={`${href}#downloads`}
                          className="btn btn--ghost"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                          Download
                        </Link>
                      ) : (
                        <span className="btn btn--ghost" aria-disabled="true">
                          <FontAwesomeIcon icon={faPlay} />
                          Em breve
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

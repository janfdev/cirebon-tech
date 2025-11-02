import React from "react";
import { Badge } from "./ui/badge";
import Image from "next/image";
import Drone from "../../public/drone-ai.webp";

const AboutSection = () => {
  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-7xl px-4  sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex justify-center">
          <Badge className="px-5 text-lg">Tentang AgroWin</Badge>
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Gambar — mobile di atas, desktop di kiri */}
          <div className="order-1 lg:order-1 lg:col-span-6">
            <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]">
              <Image
                src={Drone}
                alt="Ilustrasi drone berbasis AI memantau lahan pertanian"
                fill
                priority
                className="object-cover rounded-xl shadow-md"
              />
            </div>
          </div>

          <div className="order-2 lg:order-2 lg:col-span-6">
            <div className="max-w-2xl">
              <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                Inovasi AI untuk Pertanian Cerdas
              </h2>

              <p className="mt-4 text-sm sm:text-base text-muted-foreground">
                AgroWin dikembangkan untuk membantu petani menentukan waktu tanam
                dan panen terbaik, mendeteksi tanda awal penyakit tanaman, serta
                memahami kondisi lingkungan melalui analisis berbasis kecerdasan
                buatan.
              </p>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Membantu petani menanam tanaman dengan efisien dan menguntungkan. 
                AgroWin adalah aplikasi web yang membantu petani menentukan waktu tanam 
                dan panen terbaik melalui analisis data cuaca dan lingkungan secara cerdas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

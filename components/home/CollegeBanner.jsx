import React from 'react'
import Image from 'next/image';


const Banner = ({ images, speed = 5000 }) => {
    console.log(images[0][0], "dream")
    return (
      <div className="relative w-96 overflow-hidden h-96">
        <div className="absolute flex">
          <section style={{ "--speed": `${speed}ms` }} className="fex">
            {images.forEach(({ image, id }) => (
              <div className="image" key={id}>
                <Image width={300} height={50} src={image} alt={id} className="h-128 px-16 object-cover"/>
              </div>
            ))}
          </section>
          <section style={{ "--speed": `${speed}ms` }} className="animate-ping">
          <div className="w-full items-center justify-center overflow-hidden py-8 md:flex md:py-0">
          {images.map((institution, i) => (
            <Image
              alt={institution[1] ?? ""}
              key={institution[0]}
              src={`/${institution[1]}`}
              width={256}
              height={100}
              className="mx-12 max-w-lg object-contain py-2"
            />
          ))}
        </div>
          </section>
          <section style={{ "--speed": `${speed}ms` }}  className="">
            {images.map((image, id) => (
              <div className="image" key={id}>
                <img src={image} alt={id} className="h-128 px-16 object-cover"/>
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  };
  

  export default Banner
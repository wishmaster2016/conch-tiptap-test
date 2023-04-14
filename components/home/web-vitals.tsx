import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { RED_SCORE_MAX, YELLOW_SCORE_MAX } from "utils/constants";

// Generate typescript props for webvitals
type WebVitalsProps = {
  score: number;
};

export default function WebVitals({ score }: WebVitalsProps) {
  const [fillColor, setFillColor] = useState("#DCFCE7");
  const [strokeColor, setStrokeColor] = useState("#22C55E");
  const [strokeColorTailwind, setStrokeColorTailwind] =
    useState("text-green-500");

  useEffect(() => {
    if (score <= RED_SCORE_MAX) {
      // red zone
      setFillColor("#FFCACA");
      setStrokeColor("#FF4444");
    } else if (score <= YELLOW_SCORE_MAX) {
      // yellow zone
      setFillColor("#fffbc9");
      setStrokeColor("#F59E0B");
    } else {
      // green zone
      setFillColor("#DCFCE7");
      setStrokeColor("#22C55E");
    }
  }, [score]);

  return (
    <div className="relative h-full w-full">
      <motion.svg
        className="m-auto"
        viewBox="0 0 100 100"
        width={120}
        height={120}
      >
        <motion.circle
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 5, ease: "easeOut" }}
          strokeWidth={7}
          strokeDasharray="0 1"
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          cx="50"
          cy="50"
          r="45"
          fill={fillColor}
          stroke={strokeColor}
        />
      </motion.svg>
      <p
        className="absolute inset-0 mx-auto flex items-center justify-center font-display text-5xl text-green-500"
        style={{ color: strokeColor }}
      >
        {score}
      </p>
    </div>
  );
}

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(useGSAP, MotionPathPlugin, ScrollTrigger);

export { gsap, useGSAP, MotionPathPlugin, ScrollTrigger };

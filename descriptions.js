const AMP_PARAMS_DESC =
  "<br><br><small><strong>Gain:</strong> Adjust the preamp gain/drive level.<br><strong>Level:</strong> Adjust the output volume.<br><strong>Bass / Mid / Treble:</strong> Adjust the low, mid, and high frequency response.</small>";
const CAB_PARAMS_DESC =
  "<br><br><small><strong>Level:</strong> Adjust the output volume.<br><strong>Low Cut:</strong> Adjust the low cut point (20Hz - 300Hz).<br><strong>High Cut:</strong> Adjust the high cut point (18.0kHz - 5.0kHz).</small>";
const FX_GATE_DESC =
  "<br><br><small><strong>Gate:</strong> Adjust the threshold of the Noise Gate. When set to 0, the effect is turned off.";
const DLY_TIME_600 =
  "<br><br><small><strong>Time:</strong> Adjust the feedback speed of echo repeats (600–60 bpm).<br>";
const DLY_TIME_1200 =
  "<br><br><small><strong>Time:</strong> Adjust the feedback speed of echo repeats (1200–120 bpm).<br>";
const DLY_FB_MIX =
  "<strong>Feedback:</strong> The feedback times of echo repeats.<br><strong>Mix:</strong> Adjust the dry and wet ratio.<br>";
const MOD_SPEED_DESC =
  "<br><br><small><strong>Speed:</strong> Adjust the modulation speed/rate.";
const MOD_SPEED_DEPTH_DESC =
  MOD_SPEED_DESC +
  "<br><strong>Depth:</strong> Adjust the modulation depth/intensity.";
const REV_DECAY_MIX =
  "<br><br><small><strong>Decay:</strong> Adjust the duration of echo.<br><strong>Mix:</strong> Adjust the ratio of wet and dry.<br>";
const REV_HP_LP =
  "<strong>HPass:</strong> HIGH pass, only used to regulate wet sound.<br><strong>LPass:</strong> Low pass, only used to regulate wet sound.<br>";
const REV_STD_DESC = REV_DECAY_MIX + REV_HP_LP;
const REV_DEPTH_DESC =
  "<strong>Depth:</strong> The pitch of wet sound produces a small cyclical rise and fall, you will hear a vintage and charming background sound.";

// Dictionary of descriptions based on original factory models.
// Maps the exact model name (returned by the pedal) to its description.
window.EFFECT_DESCRIPTIONS = {
  // FX (Based on official M-Vave manual)
  "Noise Gate++":
    "High quality noise gate designed to silence noise in high-gain setups." +
    FX_GATE_DESC +
    "</small>",
  Boost:
    "Provides a clean gain to push your amplifier without coloring the tone." +
    FX_GATE_DESC +
    "<br><strong>Gain:</strong> Adjust the gain of the Boost.</small>",
  Compress:
    "Classic studio-style compressor to level out dynamics." +
    FX_GATE_DESC +
    "<br><strong>Attack:</strong> Controls the attack/intensity of the compressed wet sound. The dry sound is reduced when this parameter is increased; at this time, the Level parameter should be appropriately increased.<br><strong>Sustain:</strong> Turning the Sustain parameter down while turning the Attack parameter up can help achieve a better timbre.<br><strong>Level:</strong> Use this parameter to adjust the overall output volume of this module.</small>",
  "AI Gate MS":
    "Intelligent Noise Gate that utilizes AI to preserve note tails." +
    FX_GATE_DESC +
    "<br><strong>Bias:</strong> Adjust the sensitivity/bias of the intelligent tracking.</small>",

  // MOD (Based on official M-Vave manual)
  Chorus:
    "Classic, warm and lush chorus effect." +
    MOD_SPEED_DEPTH_DESC +
    "<br><strong>Mix:</strong> Adjust the dry and wet ratio.</small>",
  Phaser:
    "Classic vintage phaser effect." +
    MOD_SPEED_DESC +
    "<br><strong>Dry:</strong> Adjust the amount of dry sound used.<br><strong>Wet:</strong> Adjust the amount of wet sound used.<br><strong>Feedback:</strong> Adjust the feedback amount of Phaser.</small>",
  Tremolo:
    "It is basically a change of the signal level controlled by an Low-frequency Oscillator." +
    MOD_SPEED_DEPTH_DESC +
    "<br><strong>Level:</strong> Use this parameter to adjust the output volume of this Module again.</small>",
  Flanger:
    "It is use the same principle as Chorus, but it uses a shorter delay time and adds regeneration(or repeats) to the modulating delay. This results in an exaggerated up and down sweeping motion to the effect." +
    MOD_SPEED_DEPTH_DESC +
    "<br><strong>Feedback:</strong> Adjust the feedback amount of Flanger.<br><strong>Mix:</strong> Adjust the dry and wet ratio.</small>",
  Vibrato:
    "The vibrato effect modulates the pitch of the incoming signal. The result is similar to the Tremolo technique used by vocalists. In contrast to a Chorus or Flanger effect, no direct signal is combined with the pitch-modulated signal." +
    MOD_SPEED_DEPTH_DESC +
    "</small>",
  Univibe:
    "A unique timbre, a combination of chorus and phaser." +
    MOD_SPEED_DEPTH_DESC +
    "<br><strong>Mix:</strong> Adjust the dry and wet ratio.</small>",
  Autofilter:
    "An auto-wah/envelope filter effect that dynamically sweeps the frequency response." +
    MOD_SPEED_DESC +
    "<br><strong>Min:</strong> Adjust the minimum frequency of the filter sweep.<br><strong>Max:</strong> Adjust the maximum frequency of the filter sweep.<br><strong>Mix:</strong> Adjust the dry and wet ratio.<br><strong>Feedback:</strong> Adjust the filter feedback.</small>",

  // DLY (Based on official M-Vave manual)
  Analog:
    "It is the delay effect of the signal of an analog tube, featuring a retro and warm timbre character." +
    DLY_TIME_600 +
    DLY_FB_MIX +
    "<strong>Phaser:</strong> Adds a Phaser effect to the delay's wet sound. This parameter adjusts the amount of Phaser used.<br><strong>Frequency:</strong> Adjusts the speed and frequency of the Phaser effect.</small>",
  Duck:
    'Adds a Noise Gate before the delayed wet sound. This suppresses the front part of the wet signal to achieve an "evasive" effect, allowing the sound to gradually increase. The dynamics of the delay are more "felt" than "heard."' +
    DLY_TIME_600 +
    DLY_FB_MIX +
    "<strong>Unpack:</strong> Turning this parameter up unpacks the sudden volume rise of the rear part of the wet sound, achieving smoother delay dynamics.<br><strong>Speed:</strong> Adds a Chorus effect to the delay's wet sound. This parameter adjusts the speed of the Chorus.<br><strong>Depth:</strong> Adjusts the depth of the Chorus effect.</small>",
  Dtape:
    "Replicates the unique style of a vintage tape machine. It delivers the warmth and silkiness of a professional-grade tape deck while simulating real-world tape characteristics like CRINKLE, BIAS, and more." +
    DLY_TIME_600 +
    DLY_FB_MIX +
    "<strong>Grit:</strong> Functions as TAPE BIAS. It adjusts the tape machine bias from under-biased to over-biased, sounding like an overdrive on the wet signal. Bias sets the dynamic range and headroom of the wet sound.<br><strong>Speed:</strong> Functions as TAPE CRINKLE. It adjusts the amount and severity of tape irregularities (friction, creases, splices, and contaminants). Tape Crinkle tracks according to the tape speed. Set to minimum for a fresh, clean tape; set to maximum for a tape that has been mangled and chewed for years.<br><strong>Depth:</strong> Controls mechanically-related tape speed fluctuations. This results in a natural, tape-machine-style modulation similar to a chorus. Set to minimum for a finely-tuned, serviced machine; set to maximum to hear a machine in dire need of service.</small>",
  Dual:
    "Features two independent delay echoes. The time-lag between the first and second echo creates a highly engaging delay rhythm effect." +
    DLY_TIME_1200 +
    DLY_FB_MIX +
    "<strong>Time-Mode:</strong> Adjusts the time-lag between the two echoes. The minimum setting represents no time-lag, with higher values increasing the lag.<br><strong>Speed:</strong> Adds a Chorus effect to the delay's wet sound. This parameter adjusts the speed of the Chorus.<br><strong>Depth:</strong> Adjusts the depth of the Chorus effect.</small>",
  Lofi:
    "A special, retro, and destructive delay effect where the wet sound reflects characteristics of filters, vinyl records, lo-fi noise, and other vintage textures." +
    DLY_TIME_600 +
    DLY_FB_MIX +
    "<strong>Grit:</strong> When turned up, it creates an overdriven quality on the wet sound.<br><strong>Speed:</strong> Adds a Chorus effect to the delay's wet sound. This parameter adjusts the speed of the Chorus.<br><strong>Depth:</strong> Adjusts the depth of the Chorus effect.</small>",

  // REV (Based on official M-Vave manual)
  Room:
    "Simulates a relatively small, simple-structured room sound where many reflections are absorbed by soft material in the room, and sound is reflected by walls." +
    REV_STD_DESC +
    REV_DEPTH_DESC +
    "</small>",
  Hall:
    "It gives a wide, slightly scattering feeling, simulating a grand ambient sound." +
    REV_STD_DESC +
    REV_DEPTH_DESC +
    "</small>",
  Swell:
    "The Swell machine brings in the reverb gradually behind the dry signal for subtle evolving textures, like having a volume pedal on the wet sound.<br><br><small><strong>Decay:</strong> Adjust the duration of echo.<br><strong>Mix:</strong> Adjust the ratio of wet and dry. If the dry sound is removed and the RiseT parameter is set to 0, it can mimic the sound of string instruments such as the violin.<br>" +
    REV_HP_LP +
    "<strong>RiseTime:</strong> It adjusts the rise time of the swelled signal. It is suggested to choose shorter times for single-line soloing or longer times for ambient chord work.</small>",
  Spring:
    "It is a common type of reverberation. The sound signal is transmitted to the spring tank, and the pickup picks up the resonant sound of the spring tank to mimic the reverberation effect produced in space." +
    REV_STD_DESC +
    "<strong>Combs:</strong> Control the number of springs.</small>",
  Shimmer:
    "There is a pitch-shift sound in the wet sound. Adjusting the pitch of the pitch-shift sound can yield a dissonant interval to create a scary background sound, or a harmonic interval for a wonderful, resplendent, and unearthly ambience. The Amount parameter allows for a range of shimmer effects from laid-back and subtle to full-blown majestic splendor." +
    REV_DECAY_MIX +
    "<strong>Tone:</strong> Adjust the high frequency of the reverb wet sound.<br><strong>Pitch:</strong> Adjust the pitch of the pitch-shift sound. The minimum value is the same as the original sound, and the maximum value is two octaves above the original sound.<br><strong>Amount:</strong> Adjust the amount of pitch-shift sound.</small>",
  Cloud:
    "A gorgeous large ambient reverberation that sounds like the music is coming from all sides of the cloud. Cloud reverb can take any modest guitar or synth sound and turn it into a gorgeous ensemble." +
    REV_STD_DESC +
    "<strong>Diffusion:</strong> Softens the early reflections to create a more diffused reverb. As Diffusion is increased, the reverb is smoothed and softened, allowing the delay and reverberation to mix together more naturally.</small>",

  // AMP (Based on official M-Vave table)
  J900_CL:
    "<strong>[Clean]</strong> Based on Marshall JCM900. Transparent and solid with rich dynamics, clear articulation under light overdrive, ideal for classic rock and blues clean tones." +
    AMP_PARAMS_DESC,
  "FD CL":
    "<strong>[Clean]</strong> Based on Fender 65 Deluxe Reverb. Classic American clean tone, bright, transparent, loose and warm, with subtle spring reverb character, perfect for country, blues and pop clean sounds." +
    AMP_PARAMS_DESC,
  JC120_CL:
    "<strong>[Clean]</strong> Based on Roland JC-120 Jazz Chorus. Extremely clean and stereo clean tone, with iconic chorus spatiality, smooth mids and detailed highs, great for jazz, funk and clean rhythm playing." +
    AMP_PARAMS_DESC,
  "BLUE OD":
    "<strong>[Overdrive]</strong> Based on BJFe Baby Blue OD Deluxe. Smooth and musical overdrive, delicate at low gain, transparent at high gain, full mids without harshness, suitable for blues, pop and light rock." +
    AMP_PARAMS_DESC,
  "RAT OD":
    "<strong>[Overdrive]</strong> Based on Pro Co RAT. Classic gritty overdrive, prominent mids, tough texture, direct and powerful breakup, designed for rock, punk and vintage hard rock." +
    AMP_PARAMS_DESC,
  "M-VAVE OD":
    "<strong>[Overdrive]</strong> Based on M-VAVE OD. Modern balanced overdrive, high clarity, low noise, versatile for various styles, great for both rhythm and solo." +
    AMP_PARAMS_DESC,
  "SUPA OD":
    "<strong>[Overdrive]</strong> Based on Xotic EP. Smooth overdrive that enhances dynamics and definition, tight and detailed, perfect for boosting amps, improving clean tone and shaping solo lines." +
    AMP_PARAMS_DESC,
  "DARKS DS":
    "<strong>[Distortion]</strong> Based on TC Electronic Dark Matter. Modern high-gain distortion, solid lows and tight mids, built for metal and hard rock rhythms." +
    AMP_PARAMS_DESC,
  "J900 DS":
    "<strong>[Distortion]</strong> Based on Marshall JCM900. Classic British high-gain, rough and powerful with long sustain, the core tone for classic rock and hard rock." +
    AMP_PARAMS_DESC,
  "JHS DS":
    '<strong>[Distortion]</strong> Based on JHS "Loud Is More Good". Modern American distortion, strong impact, wide-open dynamics, ideal for punk and alternative rock.' +
    AMP_PARAMS_DESC,
  "EVH 5150":
    "<strong>[Distortion]</strong> Based on EVH 5150III 100W. Flagship American high-gain distortion, extremely aggressive, thick lows and sharp highs, made for modern metal and shred solos." +
    AMP_PARAMS_DESC,
  FRIMAN:
    "<strong>[Distortion]</strong> Based on Friedman JJ-100. Premium American high-gain distortion, refined dynamics, high-end tone, tight rhythm and transparent solo, suitable for rock, hard rock and metal." +
    AMP_PARAMS_DESC,
  "XC DS":
    "<strong>[Distortion]</strong> Based on Rocktron XDC. Modern multi-structured distortion, highly flexible with prominent mids, great for modern rock covering both rhythm and lead." +
    AMP_PARAMS_DESC,
  ROOM40:
    "<strong>[Distortion]</strong> Based on MPF Sounds Room. Vintage American distortion, warm and loose with natural spatiality, perfect for classic rock and blues-rock." +
    AMP_PARAMS_DESC,
  JVM:
    "<strong>[Distortion]</strong> Based on Marshall JVM410H. Multi-channel British high-gain, wide dynamic range and versatile, covering styles from classic rock to modern metal." +
    AMP_PARAMS_DESC,
  "AgDb750 BS":
    "<strong>[Bass]</strong> Based on Aguilar DB750. Modern high-end bass head, full lows, clear mids, warm and powerful, ideal for studio and live mainstream styles." +
    AMP_PARAMS_DESC,
  "ApSVT BS":
    "<strong>[Bass]</strong> Based on Ampeg SVTCL-. Classic tube bass head, massive and powerful lows, vintage rugged character, the iconic tone for rock and metal bass." +
    AMP_PARAMS_DESC,
  "PjBuddy BS":
    "<strong>[Bass]</strong> Based on Phil Jones Bass Buddy. Compact and clear bass tone, prominent mids, clean detail, suitable for low-power situations, pop and funk." +
    AMP_PARAMS_DESC,
  "DgXu BS":
    "<strong>[Bass]</strong> Based on Darkglass XUltra. Modern high-gain metal bass, strong impact, tight lows, designed for heavy rock and metal bass." +
    AMP_PARAMS_DESC,
  MarkLm_BS:
    "<strong>[Bass]</strong> Based on Markbass Little Mark 250. Modern Italian bass head, clear and transparent, lively dynamics, great for pop, funk, jazz and light rock." +
    AMP_PARAMS_DESC,

  // CAB (Based on official M-Vave table)
  "AC-SeVin":
    "<strong>[1x12]</strong> Sampling AC SEVIN with SM57" + CAB_PARAMS_DESC,
  "JVM 1960 57":
    "<strong>[4x12]</strong> Sampling Marshall 1960A 412 with SM57" +
    CAB_PARAMS_DESC,
  "V30 MD421":
    "<strong>[4x12]</strong> Sampling Orange PPC with MD421" + CAB_PARAMS_DESC,
  "G12-EVH CT":
    "<strong>[4x12]</strong> Sampling EVH 412 Straight with U87" +
    CAB_PARAMS_DESC,
  "HIFI OK":
    "<strong>[1x12]</strong> Sampling HIFI Full Frequency with MD421" +
    CAB_PARAMS_DESC,
  "WANGS212 ECM":
    "<strong>[2x12]</strong> Sampling Wangs GS212 G12 with U87" +
    CAB_PARAMS_DESC,
  "VOX AC30":
    "<strong>[2x12]</strong> Sampling VOX AC30 212 with U87" + CAB_PARAMS_DESC,
  FRMAN112:
    "<strong>[1x12]</strong> Sampling Friedman Vintage 112 with MD421" +
    CAB_PARAMS_DESC,
  "MeOSick-III":
    "<strong>[4x12]</strong> Sampling MESABoogie Standard Oversized with MD421" +
    CAB_PARAMS_DESC,
  SoldSC412:
    "<strong>[4x12]</strong> Sampling Soldano Straight Classic with MD421" +
    CAB_PARAMS_DESC,
  "FD TW1980":
    "<strong>[2x12]</strong> Sampling Fender 65 Deluxe Reverb with SM57" +
    CAB_PARAMS_DESC,
  "MESA 412":
    "<strong>[4x12]</strong> Sampling MesaBoogie Rectifier Traditional Straight with MD421" +
    CAB_PARAMS_DESC,
  HIW412SWF:
    "<strong>[4x12]</strong> Sampling Hiwatt SE 412 with U87" + CAB_PARAMS_DESC,
  "Recto 112":
    "<strong>[1x12]</strong> Sampling MesaBoogie Rectifier 112 with SM57" +
    CAB_PARAMS_DESC,
  "JC120 BOX":
    "<strong>[2x12]</strong> Sampling Roland JC-120 Jazz Chorus 212 with SM57" +
    CAB_PARAMS_DESC,
  Agula410:
    "<strong>[4x10]</strong> Sampling Aguilar DB 410 with SM57" +
    CAB_PARAMS_DESC,
  AgSVT410:
    "<strong>[4x10]</strong> Sampling Ampeg Heritage SVT-410 HLF with MD421" +
    CAB_PARAMS_DESC,
  DgDG212N:
    "<strong>[2x12]</strong> Sampling Darkglass DG212N with MD421" +
    CAB_PARAMS_DESC,
  MbSway210:
    "<strong>[2x10]</strong> Sampling Mesa Boogie Subway 210 with MD421" +
    CAB_PARAMS_DESC,
  Tace412:
    "<strong>[4x12]</strong> Sampling Trace Elliot 412 with SM57" +
    CAB_PARAMS_DESC,
};

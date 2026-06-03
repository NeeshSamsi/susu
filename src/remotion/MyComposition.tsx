import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <h1 style={{ opacity, color: '#000C31', fontFamily: 'sans-serif' }}>Hello Remotion in susu!</h1>
    </AbsoluteFill>
  );
};

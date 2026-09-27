import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PreviewCanvas, PreviewCanvasRef } from './components/PreviewCanvas';
import { PlayerControls } from './components/PlayerControls';
import { TopNav } from './components/TopNav';
import { InteractiveGISMap } from './components/InteractiveGISMap';
import { PipelineSpecs } from './components/PipelineSpecs';
import { CodeInspector } from './components/CodeInspector';
import { PitchStoryboard } from './components/PitchStoryboard';
import { TOTAL_DURATION } from './types';
import { tacticalAudio } from './utils/audioSynthesizer';
import { captureElementAsImage } from './utils/recorder';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'gis' | 'pipeline' | 'code' | 'pitch'>('preview');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<'fit' | 'fill' | 'original'>('fit');
  const [interactiveLayer, setInteractiveLayer] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<PreviewCanvasRef>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or pre/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - (e.shiftKey ? 1 : 0.2)));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(TOTAL_DURATION, currentTime + (e.shiftKey ? 1 : 0.2)));
      } else if (e.key === 'r' || e.key === 'R') {
        handleRestart();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const sceneStarts = [0, 3.5, 7.5, 13.5, 18.0];
        const idx = parseInt(e.key, 10) - 1;
        handleJumpToScene(sceneStarts[idx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, isPlaying, isMuted]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    tacticalAudio.playClick();
  }, []);

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time);
    canvasRef.current?.seek(time);
  }, []);

  const handleRestart = useCallback(() => {
    handleSeek(0);
    setIsPlaying(true);
    tacticalAudio.playClick();
  }, [handleSeek]);

  const handleJumpToScene = useCallback((startTime: number) => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
    }
    handleSeek(startTime);
    setIsPlaying(true);
    tacticalAudio.playClick();
  }, [activeTab, handleSeek]);

  const handleSetSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    canvasRef.current?.setSpeed(rate);
  }, []);

  const handleToggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      tacticalAudio.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleScaleMode = useCallback(() => {
    setScaleMode((prev) => {
      if (prev === 'fit') return 'fill';
      if (prev === 'fill') return 'original';
      return 'fit';
    });
  }, []);

  const handleToggleInteractiveLayer = useCallback(() => {
    setInteractiveLayer((prev) => !prev);
  }, []);

  const handleEnded = useCallback(() => {
    if (isLooping) {
      handleSeek(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  }, [isLooping, handleSeek]);

  const handleCaptureFrame = () => {
    const el = canvasRef.current?.getCanvasElement();
    if (el) {
      const timeStr = currentTime.toFixed(1).replace('.', 's');
      captureElementAsImage(el, `drishti_aid_frame_${timeStr}.png`);
      showToast('1080p Frame Snapshot exported!');
    } else {
      showToast('Frame captured');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Bar (Adheres to 3-zone contract) */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onCaptureFrame={handleCaptureFrame}
        onPlayPreview={() => {
          if (activeTab !== 'preview') setActiveTab('preview');
          handlePlayPause();
        }}
        isPlaying={isPlaying}
      />

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {activeTab === 'preview' && (
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {/* 1920x1080 Canvas Viewer */}
            <div className="flex-1 relative overflow-hidden">
              <PreviewCanvas
                ref={canvasRef}
                isPlaying={isPlaying}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                onEnded={handleEnded}
                playbackRate={playbackRate}
                scaleMode={scaleMode}
                interactiveLayer={interactiveLayer}
              />
            </div>

            {/* Bottom Scrubber & Transport Player Controls */}
            <PlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={TOTAL_DURATION}
              playbackRate={playbackRate}
              isLooping={isLooping}
              isMuted={isMuted}
              scaleMode={scaleMode}
              interactiveLayer={interactiveLayer}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSetSpeed={handleSetSpeed}
              onToggleLoop={handleToggleLoop}
              onToggleMute={handleToggleMute}
              onToggleScaleMode={handleToggleScaleMode}
              onToggleInteractiveLayer={handleToggleInteractiveLayer}
              onRestart={handleRestart}
              onJumpToScene={handleJumpToScene}
            />
          </div>
        )}

        {activeTab === 'gis' && <InteractiveGISMap />}
        {activeTab === 'pipeline' && <PipelineSpecs />}
        {activeTab === 'code' && <CodeInspector />}
        {activeTab === 'pitch' && <PitchStoryboard onJumpToScene={handleJumpToScene} />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 bg-slate-900 border border-cyan-500/40 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

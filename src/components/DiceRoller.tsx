'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface DiceRollerProps {
  diceResults?: number[];
  isRolling: boolean;
  result?: 'tai' | 'xiu';
  canReveal: boolean;
}

const DiceFace = ({ value }: { value: number }) => {
  const getDots = (num: number) => {
    const positions: { [key: number]: string[] } = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };
    return positions[num] || [];
  };

  const dotPositions: { [key: string]: string } = {
    'top-left': 'top-[20%] left-[20%]',
    'top-right': 'top-[20%] right-[20%]',
    'middle-left': 'top-[50%] left-[20%] -translate-y-1/2',
    'middle-right': 'top-[50%] right-[20%] -translate-y-1/2',
    'bottom-left': 'bottom-[20%] left-[20%]',
    'bottom-right': 'bottom-[20%] right-[20%]',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white to-gray-200 rounded-xl border-3 border-gray-800 shadow-2xl">
      {getDots(value).map((pos, idx) => (
        <div
          key={idx}
          className={`absolute w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gray-900 rounded-full ${dotPositions[pos]}`}
        />
      ))}
    </div>
  );
};

export const DiceRoller: React.FC<DiceRollerProps> = ({ diceResults, isRolling, result, canReveal }) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (!canReveal) {
      setDragOffset({ x: 0, y: 0 });
      x.set(0);
      y.set(0);
    }
  }, [canReveal, x, y]);

  const handleDrag = (event: any, info: any) => {
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const maxDistance = 150;
    const progress = Math.min(distance / maxDistance, 1);
    
    setDragOffset({
      x: info.offset.x,
      y: info.offset.y
    });
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    if (distance < 30) {
      setDragOffset({ x: 0, y: 0 });
      x.set(0);
      y.set(0);
    }
  };

  // Tính toán độ mở dựa trên khoảng cách kéo (theo mọi hướng)
  const dragDistance = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2);
  const revealProgress = Math.min(dragDistance / 120, 1);
  const isFullyRevealed = revealProgress > 0.9;

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Đĩa chứa xúc xắc */}
      <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Đĩa (Plate) */}
        <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 shadow-2xl border-8 border-amber-900">
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 shadow-inner" />
          
          {/* Pattern trang trí trên đĩa */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-amber-900"
                style={{
                  left: '50%',
                  top: '10%',
                  transformOrigin: '0 120px',
                  transform: `rotate(${i * 30}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Xúc xắc bên trong đĩa - Hiện dần theo độ mở bát */}
        <div className="absolute z-10">
          {!isRolling && diceResults && diceResults.length === 3 && canReveal && (
            <motion.div
              className="relative"
              style={{
                opacity: revealProgress,
                scale: 0.7 + (revealProgress * 0.3),
              }}
            >
              {/* 3 xúc xắc ở 3 vị trí ngẫu nhiên không chồng lên nhau */}
              {diceResults.map((value, idx) => {
                // Tạo vị trí ngẫu nhiên cho mỗi xúc xắc nhưng đảm bảo không chồng lên nhau
                const positions = [
                  { left: '-60px', top: '-40px' },    // Góc trên trái
                  { left: '60px', top: '-40px' },     // Góc trên phải
                  { left: '0px', top: '50px' },       // Góc dưới giữa
                ];
                
                return (
                  <motion.div
                    key={idx}
                    className="absolute"
                    style={{
                      ...positions[idx],
                      opacity: revealProgress,
                      scale: 0.7 + (revealProgress * 0.3),
                    }}
                    animate={isFullyRevealed ? {
                      rotate: [0, 360],
                      scale: [1, 1.15, 1],
                    } : {}}
                    transition={isFullyRevealed ? {
                      delay: idx * 0.1,
                      duration: 0.5,
                    } : {}}
                  >
                    <DiceFace value={value} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Bát úp (Bowl) - Chỉ có hình tròn, không có núm */}
        <AnimatePresence>
          {!isRolling && canReveal && (
            <motion.div
              key="bowl"
              className="absolute z-20 cursor-grab active:cursor-grabbing"
              initial={{ y: -250, opacity: 0 }}
              animate={{ 
                x: dragOffset.x, 
                y: dragOffset.y, 
                opacity: 1,
                rotate: dragOffset.x * 0.1 // Xoay nhẹ theo hướng kéo
              }}
              exit={{ y: -250, opacity: 0, transition: { duration: 0.5 } }}
              drag
              dragConstraints={{ 
                top: -120, 
                bottom: 120, 
                left: -120, 
                right: 120 
              }}
              dragElastic={0.2}
              dragTransition={{ power: 0.1, timeConstant: 200 }}
              onDrag={handleDrag}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ x, y }}
            >
              {/* Thân bát - Hình tròn hoàn toàn, không có núm */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                {/* Base bát - Hình cầu 3D */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-white to-blue-50 shadow-2xl border-4 border-blue-900/30">
                  
                  {/* Hiệu ứng ánh sáng 3D */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/30 to-transparent" />
                                    
                  {/* Hoa văn trang trí - Vòng tròn xanh */}
                  <div className="absolute inset-6 rounded-full border-3 border-blue-700/30" />
                  
                  {/* Pattern hoa văn tròn */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* Hoa văn cánh hoa 8 cánh */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-6 h-10 sm:w-8 sm:h-12 left-1/2 top-1/2 origin-bottom"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-35px)`,
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-t from-blue-600/20 to-blue-400/10 rounded-t-full" />
                      </div>
                    ))}
                    
                    {/* Tâm hoa văn giữa bát */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/30" />
                    </div>
                    
                    {/* Chấm trang trí nhỏ xung quanh */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`dot-${i}`}
                        className="absolute w-1.5 h-1.5 rounded-full bg-blue-600/30"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-50px)`,
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Đường viền xanh dưới cùng */}
                  <div className="absolute bottom-3 left-10 right-10 h-1.5 rounded-full bg-blue-700/20" />
                  
                  {/* Shine effect - Ánh sáng phản chiếu */}
                  <div className="absolute top-6 left-8 w-16 h-10 sm:w-20 sm:h-12 bg-white/50 rounded-full blur-xl" />
                  <div className="absolute bottom-8 right-10 w-12 h-6 sm:w-14 sm:h-8 bg-blue-100/30 rounded-full blur-lg" />
                </div>

                {/* Shadow dưới bát */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-3 sm:w-40 sm:h-4 bg-black/30 rounded-full blur-xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hiệu ứng lắc bát khi đang rolling */}
        {isRolling && (
          <motion.div
            className="absolute z-30 pointer-events-none"
            animate={{
              y: [0, -8, 0, -6, 0],
              rotate: [0, -4, 4, -2, 0],
              x: [0, 2, -2, 1, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Thân bát - Không có núm */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 via-white to-blue-50 shadow-2xl border-4 border-blue-900/30">
                <div className="absolute top-0 left-0 right-0 h-8 rounded-t-full bg-gradient-to-b from-blue-800/40 to-transparent" />
                <div className="absolute inset-6 rounded-full border-3 border-blue-700/30" />
                
                {/* Pattern đơn giản khi lắc */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30" />
                
                <div className="absolute top-6 left-8 w-16 h-10 sm:w-20 sm:h-12 bg-white/50 rounded-full blur-xl" />
              </div>
            </div>

            {/* Sound waves effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-60 h-60 sm:w-72 sm:h-72 border-2 border-blue-400/40 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-white shadow-lg backdrop-blur-sm text-xs sm:text-sm"
              animate={{ opacity: [1, 0.8, 1], scale: [1, 1.05, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
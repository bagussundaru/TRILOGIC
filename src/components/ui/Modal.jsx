import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * QCLAY-Style Modal Component
 * - Backdrop: fade + blur
 * - Content: scale + fade
 * - Close button: rotate on hover
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '600px'
}) {
    // Close on Escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, handleKeyDown]);

    // Animation variants - QCLAY style
    const backdropVariants = {
        hidden: {
            opacity: 0,
            backdropFilter: 'blur(0px)'
        },
        visible: {
            opacity: 1,
            backdropFilter: 'blur(4px)',
            transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 20,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/70"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div
                            className="relative bg-white rounded-xl shadow-2xl overflow-hidden w-full"
                            style={{ maxWidth }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button - Rotate on hover */}
                            <motion.button
                                className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-10"
                                onClick={onClose}
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-5 h-5" />
                            </motion.button>

                            {/* Modal Header */}
                            {title && (
                                <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                                    <h2 className="text-2xl font-bold text-[#1a1a1a]">{title}</h2>
                                </div>
                            )}

                            {/* Modal Body */}
                            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

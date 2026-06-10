import type { Document } from "../../../types/ContractDataType";
import {useState, useEffect, useRef} from "react";
import {Modal} from "antd";

import { CameraFilled, CloseCircleOutlined } from "@ant-design/icons";

import { SendScanDocument, GetScanDocument, DeleteScanDocument } from "../../../api/scanDocument";

type DocumentEditProps = {
    mode: "create" | "view" | "edit" | "viewVersion";
    contractCode: string;
}

export default function DocumentEdit({ contractCode, mode }: DocumentEditProps) {

    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [dragging, setDragging] = useState(false);

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles = Array.from(fileList);

        setFiles((prev) => [...prev, ...newFiles]);
    };

    const [open, setOpen] = useState(false);
    const [openScan, setOpenScan] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [focusDocument, setFocusDocument] = useState<Document | null>(null);

    useEffect(() => {
        console.log("Loading documents for contract:", contractCode, "in mode:", mode);
        const loadDocuments = async () => {
            if (mode === "create" || mode === "viewVersion") {
                setDocuments([]);
                return;
            }
            // Simulate an API call to fetch documents
            // Replace this with your actual API call
            const fetchedDocuments: Document[] = [
                { id: "1", name: "Document 1", fileType: "pdf", url: "#" },
                { id: "2", name: "Document 2", fileType: "docx", url: "#" }
            ]
            setDocuments(fetchedDocuments);
            
        };
        loadDocuments();
    }, [contractCode, mode]);

    return (
        <div className="w-full flex flex-col gap-4">
            <Modal title="Tài liệu đính kèm" open={open} onCancel={() => setOpen(false)} footer={null}
                width={600}
                centered
            >
                <>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div
                    className={`flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm transition
                        ${
                            dragging
                                ? "border-cyan-500 bg-cyan-50"
                                : "border-slate-300 bg-slate-50 text-slate-500 hover:border-cyan-400 hover:bg-cyan-50"
                        }`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => {
                        setDragging(false);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);

                        handleFiles(e.dataTransfer.files);
                    }}
                >
                    Thả file vào đây hoặc bấm để chọn file
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between rounded border p-2"
                            >
                                <span>{file.name}</span>
                                <span className="text-sm text-slate-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                    <div className="flex flex-row justify-between mt-4">
                        <div className="flex flex-row items-center gap-3">
                            <button className="rounded px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                    setOpenScan(true);
                                }}>
                                Scan giấy tờ
                            </button>
                            <button className="rounded px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                    setFiles([]);
                                    setOpen(false);
                                    setOpenScan(false);
                                }}>
                                Hủy
                            </button>
                        </div>
                        <div>
                            <button className="rounded px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    // Xử lý tải file lên
                                }}>
                                Tải lên
                            </button>
                        </div>
                    </div>
                </>
            </Modal>
            <Modal title="Scan giấy tờ" open={openScan} onCancel={() => {setOpenScan(false)}} footer={null} width={"100%"} height={"100%"} centered>
                {CameraScan({ openScan, setOpenScan })}
            </Modal>
            <div className="text-lg font-semibold">Tài liệu đính kèm</div>
            <div>Hợp đồng: {contractCode} - {documents.length} tài liệu</div>
            <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700"
                onClick={() => setOpen(true)}>
                    Thêm tài liệu
                </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4"
                        onClick={() => {
                            setFocusDocument(doc);
                        }}>
                        <div className="text-2xl">
                            {doc.fileType === "pdf" && "📄"}
                            {doc.fileType === "docx" && "📝"}
                            {doc.fileType === "xlsx" && "📊"}
                            {doc.fileType === "txt" && "📄"}
                            {doc.fileType === "jpg" && "🖼️"}
                            {doc.fileType === "png" && "🖼️"}
                        </div>
                        <div>
                            <div className="font-medium">{doc.name}</div>
                        </div>
                    </div>
                ))}
            </div>
            {focusDocument && (
                <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <div className="text-lg font-semibold mb-4">{focusDocument.name}</div>
                        <div className="mb-4">Loại file: {focusDocument.fileType}</div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                                onClick={() => {
                                    if (focusDocument.fileType === "pdf" || focusDocument.fileType === "jpg" || focusDocument.fileType === "png") {
                                        window.open(focusDocument.url, "_blank");
                                    }
                                }}
                            >
                                Xem
                            </button>
                            <button
                                className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                onClick={() => {
                                    // Tải file về
                                    const link = document.createElement("a");
                                    link.href = focusDocument.url;
                                    link.download = focusDocument.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                Tải về
                            </button>
                            <button
                                className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                onClick={() => {
                                    // Xóa file
                                }}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
// mở modal scan giấy tờ toàn màn hình, chụp để tạo file ảnh để tạo document mới, sau đó upload lên server và thêm vào danh sách document của hợp đồng
type CameraScanProps = {
    openScan: boolean;
    setOpenScan: (open: boolean) => void;
}

function CameraScan({ openScan, setOpenScan }: CameraScanProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [uploadImage, setUploadImage] = useState<File | null>(null);
    const [cropImage, setCropImage] = useState<File | null>(null);
    const [imageID, setImageID] = useState<string | null>(null);

    const captureImage = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const file = new File(
                    [blob],
                    `scan_${Date.now()}.png`,
                    {
                        type: "image/png"
                    }
                );

                console.log(
                    "Captured:",
                    canvas.width,
                    "x",
                    canvas.height,
                    Math.round(blob.size / 1024),
                    "KB"
                );

                setUploadImage(file);
            },
            "image/png"
        );
    };

    useEffect(() => {
        if (!uploadImage) return;
        const uploadImageToAPI = async () => {
            setLocalLoading(true);
            const imageId = await SendScanDocument(uploadImage);
            setLocalLoading(false);
            if (imageId) {
                setImageID(imageId || null);
                const file = await GetScanDocument(imageId);
                if (file) {
                    setCropImage(file);
                }
            }
            setLocalLoading(false);
        };

        uploadImageToAPI();
    }, [uploadImage]);

    useEffect(() => {
        if (!openScan) return;

        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 4096
                        },

                        height: {
                            ideal: 2160
                        },

                        frameRate: {
                            ideal: 30,
                            max: 30
                        }
                    },
                    audio: false
                });

                const track = stream.getVideoTracks()[0];

                console.log(
                    "Camera settings:",
                    track.getSettings()
                );

                try {
                    const capabilities = track.getCapabilities();

                    const advanced: MediaTrackConstraintSet = {};

                    if ("focusMode" in capabilities) {
                        (advanced as any).focusMode = "continuous";
                    }

                    await track.applyConstraints({
                        advanced: [advanced]
                    });
                } catch {
                    console.log(
                        "Focus constraints not supported"
                    );
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                    await videoRef.current.play();

                    console.log(
                        "Actual resolution:",
                        videoRef.current.videoWidth,
                        "x",
                        videoRef.current.videoHeight
                    );
                }
            } catch (err) {
                console.error(err);
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream
                    .getTracks()
                    .forEach(track => track.stop());
            }
        };
    }, [openScan]);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            <Modal
                open={localLoading}
                centered
                footer={null}
                closable={false}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                    <div className="text-lg font-semibold loading-text">Đang xử lý...</div>
                </div>
            </Modal>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
            />

            <canvas
                ref={canvasRef}
                className="hidden"
            />
            {cropImage !== null ? (
                <>
                    <img
                        src={cropImage ? URL.createObjectURL(cropImage) : undefined}
                        alt="Cropped"
                        className="absolute inset-0 h-full w-full object-contain"
                    />
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                        <button
                            className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                            onClick={() => { }}
                        >
                            Lưu
                        </button>
                        <button
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                            onClick={async () => {
                                if (imageID) {
                                    await DeleteScanDocument(imageID);
                                }
                                setCropImage(null);
                                setUploadImage(null);
                            }}
                        >
                            Chụp lại
                        </button>   
                    </div>
                </>
            ) : (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                    <button
                        className="h-16 w-16 text-[1.5rem] rounded-full bg-white"
                        onClick={async () => {
                            await captureImage();
                        }}
                    >
                        <CameraFilled/>
                    </button>

                    <button
                        className="rounded-full bg-red-600 hover:bg-red-700 px-4 py-2 text-white"
                        onClick={() => {
                            setOpenScan(false);
                        }}
                    >
                        <CloseCircleOutlined />
                    </button>
                </div>
            )}
        </div>
    )
}
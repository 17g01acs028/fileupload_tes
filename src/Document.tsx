import React, { FunctionComponent, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, message, Modal, notification, Upload } from 'antd';
import { BLOCKED_EXTENSIONS, dummyRequest, FILE_TYPES } from './FileUtils';
import type { UploadFile } from 'antd/es/upload/interface';
import { RcFile } from 'antd/lib/upload';
import { compressImage } from './filecompressor';

interface OwnProps {}
type Props = OwnProps;

const getValueFromEvent = (e: any) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
};

const MAX_SIZE_KB = 5000;
const ALLOWED_TYPES = ['png', 'jpg'];
const ACCEPTED_FILE_TYPES = ALLOWED_TYPES.map((type) => `.${type}`);
const fileHelperText = `Allowed extensions (${ACCEPTED_FILE_TYPES}). Max Size (${MAX_SIZE_KB}KB)`;

const EXT_MIME_MAP: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
};

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const resolveFileMime = (file: RcFile): string => {
    if (file.type === 'image/jpg') return 'image/jpeg';
    if (file.type) return file.type;
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return EXT_MIME_MAP[ext] || '';
};

export const Documents: FunctionComponent<Props> = () => {
    const [form] = Form.useForm();

    const allowedConfigs = ALLOWED_TYPES.map((type) => FILE_TYPES[type]).filter(Boolean);
    const allowedMimes = allowedConfigs.map((config) => config.mime);
    const allowedExts = allowedConfigs.map((config) => config.ext);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const validateFile = (file: RcFile, skipSizeCheck = false): boolean => {
        const fileName = file.name.toLowerCase();
        const fileExt = fileName.substring(fileName.lastIndexOf('.'));
        const resolvedMime = resolveFileMime(file);

        if (!allowedMimes.includes(resolvedMime)) {
            message.error(`Only ${ALLOWED_TYPES.join(', ').toUpperCase()} files are allowed`);
            return false;
        }

        if (!allowedExts.includes(fileExt)) {
            message.error(`Invalid file extension. Allowed: ${allowedExts.join(', ')}`);
            return false;
        }

        const hasDangerousExt = BLOCKED_EXTENSIONS.some(
            (ext) => fileName.includes(`.${ext}.`) || fileName.endsWith(`.${ext}`)
        );
        if (hasDangerousExt) {
            message.error('File contains dangerous extensions and cannot be uploaded');
            return false;
        }

        if (!skipSizeCheck && file.size / 1024 > MAX_SIZE_KB) {
            message.error(`File size must be less than ${MAX_SIZE_KB}KB`);
            return false;
        }

        return true;
    };

    const beforeFileUpload = async (file: RcFile): Promise<File | boolean> => {
        const resolvedMime = resolveFileMime(file);
        const isImage = resolvedMime.startsWith('image/');
        const isValid = validateFile(file, isImage);
        if (!isValid) return Upload.LIST_IGNORE;

        if (!isImage) return file;
        if (file.size / 1024 <= MAX_SIZE_KB) return file;

        try {
            const compressed = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.8,
                maxSizeKB: MAX_SIZE_KB,
            });

            if (compressed.size / 1024 > MAX_SIZE_KB) {
                message.error(`This file is too large and could not be compressed below ${MAX_SIZE_KB}KB`);
                return Upload.LIST_IGNORE;
            }

            message.success(
                `Compressed: ${(file.size / 1024).toFixed(0)} KB → ${(compressed.size / 1024).toFixed(0)} KB`
            );
            return compressed;
        } catch {
            message.error('Image compression failed.');
            return Upload.LIST_IGNORE;
        }
    };

    const onSubmit = async (values: any) => {
        try {
            const finalObj: any = {};

            if (values?.other_documents?.length > 0) {
                finalObj.other_documents = await Promise.all(
                    values.other_documents.map(async (group: any) => {
                        const processedDocs = await Promise.all(
                            (group?.documents || []).map(async (file: any) => {
                                const base64Content =
                                    file.base64 || (file.originFileObj ? await getBase64(file.originFileObj) : null);
                                return { uid: file.uid, name: file.name, type: file.type, base64: base64Content };
                            })
                        );
                        return { ...group, documents: processedDocs };
                    })
                );
            }

            await Promise.all(
                Object.entries(values)
                    .filter(([key]) => key !== 'other_documents')
                    .map(async ([fileKey, fileValue]: any) => {
                        if (!fileValue?.[0]) return;
                        const file = fileValue[0];
                        const base64Content =
                            file.base64 || (file.originFileObj ? await getBase64(file.originFileObj) : null);
                        finalObj[fileKey] = [{ uid: file.uid, name: file.name, type: file.type, base64: base64Content }];
                    })
            );

            console.log('Submitted documents:', finalObj);
            message.success('Documents submitted successfully!');
        } catch (e: any) {
            notification.error({
                key: 'DOCUMENT_ERROR',
                style: { background: '#FFF5F5', border: `1px solid #F03E3E` },
                duration: 0,
                placement: 'bottom',
                message: 'Document Submit Error',
                description: <React.Fragment>{e.message}</React.Fragment>,
            });
        }
    };

    return (
        <React.Fragment>
            <Form layout={'vertical'} form={form} onFinish={onSubmit} autoComplete={'off'}>
                <div className="online-registration__content-card-content">
                    <h3 className={'online-registration__form-section-header'}>
                        Documents - National ID (Front & Back)
                    </h3>

                    <h3 className={'online-registration__form-section-header'}>
                        Documents - Signature & Passport Photo
                    </h3>
                    <section className={'online-registration__form-section-content'}>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1 }}>
                                <Form.Item
                                    name="signature_photo_file"
                                    valuePropName="fileList"
                                    getValueFromEvent={getValueFromEvent}
                                    rules={[{ required: true, message: 'Please upload your Signature!' }]}
                                    help={fileHelperText}>
                                    <Upload
                                        name="files"
                                        accept={ACCEPTED_FILE_TYPES}
                                        customRequest={dummyRequest}
                                        multiple={false}
                                        maxCount={1}
                                        listType="picture"
                                        beforeUpload={beforeFileUpload}
                                        onPreview={handlePreview}>
                                        <Button icon={<UploadOutlined />}>Click to Upload Signature</Button>
                                    </Upload>
                                </Form.Item>
                            </div>
                        </div>
                    </section>
                </div>

                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                    <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                </Modal>

                <div className={'online-registration__content-card-footer'}>
                    <div className={'online-registration__content-card-footer--actions'}>
                        <Button type={'primary'} htmlType={'submit'}>
                            Next
                        </Button>
                    </div>
                </div>
            </Form>
        </React.Fragment>
    );
};
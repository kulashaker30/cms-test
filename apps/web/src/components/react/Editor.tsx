import * as React from "react";
import {BubbleMenu, EditorContent, FloatingMenu, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

type Props = {
    value?: string;                 // initial HTML
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
};

export default function Editor({ value = "", onChange, placeholder = "Write your story…", className = "" }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            // CodeBlockLowlight.configure({ lowlight }),
            Underline,
            Link.configure({ openOnClick: true, autolink: true, protocols: ["http", "https", "mailto"] }),
            Image,
            Placeholder.configure({ placeholder }),
        ],
        content: value || "<p></p>",
        editorProps: {
            attributes: {
                class: "prose max-w-none focus:outline-none dark:prose-invert",
            },
        },
        onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    });

    if (!editor) return null;

    const btn = (active: boolean) =>
        `px-2 py-1 rounded-md text-sm ${active ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`;

    return (
        <div className={`rounded-2xl border bg-white dark:bg-neutral-900 dark:border-neutral-800 ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b dark:border-neutral-800">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} type="button"><strong>B</strong></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} type="button"><em>I</em></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} type="button"><u>U</u></button>
                <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} type="button">H2</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} type="button">H3</button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} type="button">• List</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} type="button">1. List</button>
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} type="button">❝</button>
                <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))} type="button">{`{ }`}</button>
                <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2 py-1 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" type="button">HR</button>
                <span className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
                <button
                    type="button"
                    className="px-2 py-1 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                        const url = prompt("Paste URL");
                        if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    }}
                >
                    Link
                </button>
                <button
                    type="button"
                    className="px-2 py-1 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                        const url = prompt("Image URL");
                        if (url) editor.chain().focus().setImage({ src: url, alt: "" }).run();
                    }}
                >
                    Image
                </button>
                <button onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" type="button">Undo</button>
                <button onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1 rounded-md text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800" type="button">Redo</button>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
                <EditorContent editor={editor} />
            </div>

            {/* Nice bubble menu for inline formatting */}
            <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
                <div className="rounded-lg border bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                    <div className="flex p-1">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} type="button"><strong>B</strong></button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} type="button"><em>I</em></button>
                        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} type="button"><u>U</u></button>
                    </div>
                </div>
            </BubbleMenu>

            {/* Floating quick-insert menu near the start */}
            <FloatingMenu editor={editor} tippyOptions={{ duration: 150 }}>
                <div className="rounded-lg border bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-800 p-1">
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} type="button">H2</button>
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} type="button">• List</button>
                    <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive("codeBlock"))} type="button">{`{ }`}</button>
                </div>
            </FloatingMenu>
        </div>
    );
}

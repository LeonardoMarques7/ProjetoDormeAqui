import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Link from "@tiptap/extension-link";
import { useState, useEffect } from "react";
import MarkdownIt from "markdown-it";
import "./Markdown.css";
import {
	Bold,
	Italic,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Link2,
	Code2,
	FileCode,
	Minus,
	Undo2,
	Redo2,
} from "lucide-react";

const md = new MarkdownIt({
	html: false,
	breaks: true,
	linkify: true,
});

export default function MarkdownEditor({ onChange, initialValue }) {
	const [markdown, setMarkdown] = useState("");

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
			}),
			Link.configure({ openOnClick: false }),
			Markdown.configure({
				html: false,
				breaks: true,
				transformPastedText: true,
				transformCopiedText: true,
			}),
		],
		content: initialValue, // <—— conteúdo inicial aqui!
		onUpdate: ({ editor }) => {
			try {
				const mdText = editor.storage.markdown.getMarkdown();
				setMarkdown(mdText);
				if (onChange) onChange(mdText);
			} catch (error) {
				console.error("Erro ao gerar markdown:", error);
			}
		},
	});

	useEffect(() => {
		if (editor) {
			const description = editor.storage.markdown.getMarkdown();
			setMarkdown(description);

			if (description) onChange(description);
		}
	}, [editor]);

	useEffect(() => {
		if (editor && initialValue) {
			editor.commands.setContent(initialValue);
		}
	}, [initialValue, editor]);

	if (!editor) return null;

	const ToolButton = ({ onClick, active, children, title }) => (
		<button
			onClick={onClick}
			title={title}
			className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
				active ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-700"
			}`}
		>
			{children}
		</button>
	);

	return (
		<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
			{/* Toolbar */}
			<div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
				<div className="flex items-center gap-1 flex-wrap">
					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleBold().run();
						}}
						active={editor.isActive("bold")}
						title="Negrito (Ctrl+B)"
					>
						<Bold size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleItalic().run();
						}}
						active={editor.isActive("italic")}
						title="Itálico (Ctrl+I)"
					>
						<Italic size={18} />
					</ToolButton>

					<div className="w-px h-6 bg-gray-300 mx-2" />

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleHeading({ level: 1 }).run();
						}}
						active={editor.isActive("heading", { level: 1 })}
						title="Título 1"
					>
						<Heading1 size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleHeading({ level: 2 }).run();
						}}
						active={editor.isActive("heading", { level: 2 })}
						title="Título 2"
					>
						<Heading2 size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleHeading({ level: 3 }).run();
						}}
						active={editor.isActive("heading", { level: 3 })}
						title="Título 3"
					>
						<Heading3 size={18} />
					</ToolButton>

					<div className="w-px h-6 bg-gray-300 mx-2" />

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleBulletList().run();
						}}
						active={editor.isActive("bulletList")}
						title="Lista com Marcadores"
					>
						<List size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleOrderedList().run();
						}}
						active={editor.isActive("orderedList")}
						title="Lista Numerada"
					>
						<ListOrdered size={18} />
					</ToolButton>

					<div className="w-px h-6 bg-gray-300 mx-2" />

					<ToolButton
						onClick={(e) => {
							const url = prompt("Insira a URL:");
							e.preventDefault();
							if (url) editor.chain().focus().setLink({ href: url }).run();
						}}
						active={editor.isActive("link")}
						title="Inserir Link"
					>
						<Link2 size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().toggleCode().run();
						}}
						active={editor.isActive("code")}
						title="Código Inline"
					>
						<Code2 size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().focus().setHorizontalRule().run();
						}}
						title="Linha Horizontal"
					>
						<Minus size={18} />
					</ToolButton>

					<div className="flex-1" />

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().undo().run();
						}}
						disabled={!editor.can().undo()}
						title="Desfazer"
					>
						<Undo2 size={18} />
					</ToolButton>

					<ToolButton
						onClick={(e) => {
							e.preventDefault();
							editor.chain().redo().run();
						}}
						disabled={!editor.can().redo()}
						title="Refazer"
					>
						<Redo2 size={18} />
					</ToolButton>
				</div>
			</div>

			{/* Editor & Preview */}
			<div className=" divide-gray-200">
				{/* Editor */}
				<div className="p-6">
					<div className="mb-3 flex items-center justify-between">
						<div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
							Editor
						</div>
					</div>
					<EditorContent
						editor={editor}
						className="min-h-[200px] min-w-full  prose w-full focus:outline-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-h1:text-4xl prose-h1:mt-4 prose-h1:mb-2
                    prose-h2:text-3xl prose-h2:mt-3 prose-h2:mb-2
                    prose-h3:text-2xl prose-h3:mt-2 prose-h3:mb-1
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-2
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4
                    prose-ul:list-disc prose-ul:my-2 prose-ul:pl-6
                    prose-ol:list-decimal prose-ol:my-2 prose-ol:pl-6
                    prose-li:text-gray-700 prose-li:mx-10
                    prose-hr:my-6 prose-hr:border-gray-300
                    [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]
                    [&_.ProseMirror>*]:my-2"
					/>
				</div>
			</div>

			{/* Debug Info (remover em produção) */}
			{markdown && (
				<details className="border-t flex flex-col !max-w-2xl border-gray-200 p-4 bg-gray-50">
					<summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
						Ver Markdown (debug)
					</summary>
					<pre className="mt-2 text-xs bg-white p-3 rounded border border-gray-200 text-wrap">
						{markdown}
					</pre>
				</details>
			)}
		</div>
	);
}

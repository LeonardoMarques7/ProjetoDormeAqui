import React from "react";
import editorjsHTML from "editorjs-html";

export default function Preview({ data }) {
	if (!data || !data.blocks) {
		return (
			<div className="text-gray-400 text-sm italic">
				Nenhum conteúdo para exibir ainda.
			</div>
		);
	}

	const parser = editorjsHTML({
		header: ({ text, level }) => `<h${level}>${text}</h${level}>`,
		paragraph: ({ text }) => `<p>${text}</p>`,
		list: ({ style, items }) => {
			const tag = style === "ordered" ? "ol" : "ul";
			return `<${tag} class="list-inside list-${style} space-y-1">
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </${tag}>`;
		},
		checklist: ({ items }) =>
			`<ul class="space-y-1">
        ${items
					.map(
						(item) => `<li class="flex items-center gap-2">
              <input type="checkbox" disabled ${
								item.checked ? "checked" : ""
							} class="accent-blue-500" />
              <span>${item.text}</span>
            </li>`
					)
					.join("")}
      </ul>`,
		code: ({ code }) =>
			`<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto"><code>${code}</code></pre>`,
		quote: ({ text, caption }) =>
			`<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">
        ${text}
        ${
					caption
						? `<footer class="mt-1 text-sm text-gray-500">— ${caption}</footer>`
						: ""
				}
      </blockquote>`,
		delimiter: () => `<hr class="my-4 border-gray-300"/>`,
		linkTool: ({ link, meta }) =>
			`<a href="${link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${
				meta?.title || link
			}</a>`,
		image: ({ file, caption }) =>
			`<figure class="my-4">
        <img src="${file?.url}" alt="${
				caption || ""
			}" class="rounded-xl w-full object-cover"/>
        ${
					caption
						? `<figcaption class="text-sm text-gray-500 mt-1">${caption}</figcaption>`
						: ""
				}
      </figure>`,
		embed: ({ embed, service, caption }) =>
			`<div class="my-4 aspect-video relative">
        <iframe src="${embed}" title="${
				caption || service
			}" class="w-full h-full absolute top-0 left-0" frameBorder="0" allowFullScreen></iframe>
        ${
					caption
						? `<div class="text-sm text-gray-500 mt-1">${caption}</div>`
						: ""
				}
      </div>`,
		table: ({ content }) =>
			`<table class="border-collapse border border-gray-300 w-full my-4">
        ${content
					.map(
						(row) =>
							`<tr>${row
								.map(
									(cell) =>
										`<td class="border border-gray-300 p-2">${cell}</td>`
								)
								.join("")}</tr>`
					)
					.join("")}
      </table>`,
		raw: ({ html }) => html,
	});

	let html;

	try {
		html = parser.parse(data);
	} catch (e) {
		console.error("Erro ao converter EditorJS → HTML", e);
		return <div className="text-red-500">Erro ao gerar preview</div>;
	}

	if (!Array.isArray(html)) html = [String(html)];

	return (
		<div className="prose prose-gray max-w-none mt-6 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-base prose-li:text-base prose-img:rounded-xl">
			{html.map((block, i) => (
				<div key={i} dangerouslySetInnerHTML={{ __html: block }} />
			))}
		</div>
	);
}

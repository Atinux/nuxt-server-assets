import { PDFDocument, TextAlignment, layoutMultilineText, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export default eventHandler(async (event) => {
  const query = getQuery(event)
  const text = query.text as string || 'Hello world!'
	const fontSize = +(query.fontSize || '35')

	const pdf = await PDFDocument.create()
	pdf.registerFontkit(fontkit)

	const overpassFont = await useStorage('assets/server/fonts').getItemRaw('overpass-regular.otf')

	const font = await pdf.embedFont(overpassFont)

	const page = pdf.addPage()
	const margin = 40

	const layout = layoutMultilineText(text, {
		alignment: TextAlignment.Left,
		font,
		fontSize,
		bounds: {
			x: margin,
			y: margin,
			width: page.getWidth() - margin * 2,
			height: page.getHeight() - margin * 2
		}
	})

	for (const line of layout.lines) {
		page.drawText(line.text, {
			x: line.x,
			y: line.y,
			size: fontSize,
			font,
			color: rgb(0, 0, 0)
		})
	}


	const pdfData = await pdf.save()

	setResponseHeader(event, 'Content-Type', 'application/pdf')
	setResponseHeader(event, 'Content-Length', pdfData.byteLength.toString())

	return pdfData
})

"""Add native Excel navigation/printing features not used by the authoring API.

Content and cell formatting are authored with @oai/artifact-tool. This pass
changes only Open XML metadata, hyperlinks, font defaults and page settings.
"""
from __future__ import annotations

import json
from pathlib import Path
import xml.etree.ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs' / 'cloudwatch_insights_20261016'
BOOK = OUT / 'CloudWatch_Logs_Insights_Cheatsheet.xlsx'
NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
DRAW = 'http://schemas.openxmlformats.org/drawingml/2006/main'
ET.register_namespace('', NS)
ET.register_namespace('r', REL)


def tag(name: str) -> str:
    return f'{{{NS}}}{name}'


def xml(element: ET.Element) -> bytes:
    return ET.tostring(element, encoding='utf-8', xml_declaration=True)


def set_child(parent: ET.Element, name: str, attributes: dict) -> ET.Element:
    found = parent.find(tag(name))
    if found is None:
        found = ET.SubElement(parent, tag(name))
    found.attrib.clear()
    found.attrib.update({k: str(v) for k, v in attributes.items()})
    return found


def finalize() -> None:
    manifest = json.loads((OUT / 'qa' / 'manifest.json').read_text(encoding='utf-8'))
    with ZipFile(BOOK) as z:
        files = {name: z.read(name) for name in z.namelist()}
    wb = ET.fromstring(files['xl/workbook.xml'])
    relationships = ET.fromstring(files['xl/_rels/workbook.xml.rels'])
    targets = {r.attrib['Id']: r.attrib['Target'] for r in relationships}
    sheets = list(wb.find(tag('sheets')))
    definitions = wb.find(tag('definedNames'))
    if definitions is None:
        definitions = ET.Element(tag('definedNames'))
        # definedNames follows sheets and precedes calcPr.
        wb.insert(list(wb).index(wb.find(tag('sheets'))) + 1, definitions)
    for existing in list(definitions):
        if existing.get('name') in {'_xlnm.Print_Area', '_xlnm.Print_Titles'}:
            definitions.remove(existing)

    order = ['sheetPr','dimension','sheetViews','sheetFormatPr','cols','sheetData',
             'sheetCalcPr','sheetProtection','protectedRanges','scenarios','autoFilter',
             'sortState','dataConsolidate','customSheetViews','mergeCells','phoneticPr',
             'conditionalFormatting','dataValidations','hyperlinks','printOptions',
             'pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks',
             'customProperties','cellWatches','ignoredErrors','smartTags','drawing',
             'legacyDrawing','legacyDrawingHF','picture','oleObjects','controls',
             'webPublishItems','tableParts','extLst']
    ranks = {tag(k): i for i, k in enumerate(order)}
    for idx, (sheetdef, info) in enumerate(zip(sheets, manifest['sheetInfo'], strict=True)):
        assert sheetdef.get('name') == info['name']
        target = targets[sheetdef.get(f'{{{REL}}}id')]
        sheet_path = target.lstrip('/') if target.startswith('/') else 'xl/' + target
        sheet = ET.fromstring(files[sheet_path])
        prop = sheet.find(tag('sheetPr'))
        if prop is None:
            prop = ET.SubElement(sheet, tag('sheetPr'))
        set_child(prop, 'pageSetUpPr', {'fitToPage': '1', 'autoPageBreaks': '0'})
        views = sheet.find(tag('sheetViews'))
        if views is not None:
            for view in views:
                view.set('showGridLines','0')
                view.set('zoomScale', '85' if idx == 1 else '100')
                view.set('zoomScaleNormal', '100')
                view.set('tabSelected', '1' if idx == 0 else '0')
        last_col = 'E' if idx == 1 else 'C'
        set_child(sheet, 'printOptions', {'horizontalCentered': '1', 'gridLines': '0'})
        set_child(sheet, 'pageMargins', {'left':'.25','right':'.25','top':'.4','bottom':'.4','header':'.15','footer':'.15'})
        set_child(sheet, 'pageSetup', {'paperSize':'8','orientation':'landscape' if idx == 1 else 'portrait','fitToWidth':'1','fitToHeight':'0'})
        footer = set_child(sheet, 'headerFooter', {})
        for child in list(footer):
            footer.remove(child)
        ET.SubElement(footer, tag('oddFooter')).text = '&L&"Meiryo UI,Regular"&9CloudWatch Logs Insights   2026-10-16&C&P / &N&R&A'
        if idx == 1:
            set_child(sheet, 'autoFilter', {'ref':f'A5:E{info["lastRow"]}'})
        if info['queryStarts']:
            breaks = set_child(sheet,'rowBreaks',{'count':len(info['queryStarts'])-1,'manualBreakCount':len(info['queryStarts'])-1})
            for c in list(breaks):
                breaks.remove(c)
            for start in info['queryStarts'][1:]:
                ET.SubElement(breaks, tag('brk'), {'id':str(start-1),'min':'0','max':'16383','man':'1'})

        if info['links']:
            links = set_child(sheet, 'hyperlinks', {})
            for c in list(links):
                links.remove(c)
            sheet_dir, basename = sheet_path.rsplit('/',1)
            rel_path = f'{sheet_dir}/_rels/{basename}.rels'
            rels = ET.fromstring(files[rel_path]) if rel_path in files else ET.Element(f'{{{PKG}}}Relationships')
            # This metadata pass is idempotent on files already processed.
            for rel in list(rels):
                if rel.get('Type','').endswith('/hyperlink'):
                    rels.remove(rel)
            used = {r.get('Id') for r in rels}
            next_id = 1
            for spec in info['links']:
                attrs = {'ref':spec['cell'],'display':spec['display']}
                if 'location' in spec:
                    attrs['location'] = spec['location']
                else:
                    while f'rId{next_id}' in used:
                        next_id += 1
                    rid = f'rId{next_id}'
                    used.add(rid)
                    attrs[f'{{{REL}}}id'] = rid
                    ET.SubElement(rels, f'{{{PKG}}}Relationship', {
                        'Id':rid,'Type':REL+'/hyperlink','Target':spec['target'],'TargetMode':'External'})
                ET.SubElement(links, tag('hyperlink'), attrs)
            if len(rels):
                files[rel_path] = xml(rels)
        children = list(sheet)
        sheet[:] = sorted(children,key=lambda e:ranks.get(e.tag,999))
        files[sheet_path] = xml(sheet)
        quoted_name = "'" + info['name'].replace("'","''") + "'"
        ET.SubElement(definitions,tag('definedName'),{'name':'_xlnm.Print_Area','localSheetId':str(idx)}).text = f'{quoted_name}!$A$1:${last_col}${info["lastRow"]}'
        if idx:
            ET.SubElement(definitions,tag('definedName'),{'name':'_xlnm.Print_Titles','localSheetId':str(idx)}).text = f'{quoted_name}!$1:${5 if idx==1 else 3}'
    bookviews = wb.find(tag('bookViews'))
    if bookviews is not None:
        for view in bookviews:
            view.set('activeTab','0')
            view.set('firstSheet','0')
    files['xl/workbook.xml'] = xml(wb)
    styles = ET.fromstring(files['xl/styles.xml'])
    for f in styles.find(tag('fonts')):
        name = f.find(tag('name'))
        if name is None:
            name = ET.SubElement(f,tag('name'))
        name.set('val','Meiryo UI')
        scheme = f.find(tag('scheme'))
        if scheme is not None:
            f.remove(scheme)
    files['xl/styles.xml'] = xml(styles)
    for name in list(files):
        if name.startswith('xl/theme/') and name.endswith('.xml'):
            theme = ET.fromstring(files[name])
            for node in theme.iter():
                if 'typeface' in node.attrib:
                    node.set('typeface','Meiryo UI')
            files[name] = xml(theme)
    temp = OUT / 'qa' / 'finalized.xlsx'
    with ZipFile(temp,'w',compression=ZIP_DEFLATED) as z:
        for name,data in files.items():
            z.writestr(name,data)
    with ZipFile(temp) as z:
        assert z.testzip() is None
    temp.replace(BOOK)
    sidecar = BOOK.with_suffix('.xlsx.inspect.ndjson')
    if sidecar.exists():
        sidecar.replace(OUT / 'qa' / sidecar.name)
    print(f'Finalized {len(sheets)} sheets. Meiryo UI fonts, links, filters, A3 printing configured.')


if __name__ == '__main__':
    finalize()

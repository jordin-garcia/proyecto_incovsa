# Abre un .docx en Word, actualiza los índices y los campos, guarda y, si se indica, exporta a PDF.
# Uso, desde entregable-2/:
#   powershell -ExecutionPolicy Bypass -File herramientas/actualizar_indices.ps1 "Documento 2 - ... v0.1.docx" [salida.pdf]
param(
  [Parameter(Mandatory = $true)][string]$Documento,
  [string]$Pdf
)
$ruta = (Resolve-Path $Documento).Path
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($ruta, $false, $false)
  # Dos pasadas: la primera numera figuras y tablas; la segunda corrige las páginas de los índices
  for ($i = 0; $i -lt 2; $i++) {
    $doc.Fields.Update() | Out-Null
    foreach ($t in $doc.TablesOfContents) { $t.Update() | Out-Null }
    foreach ($t in $doc.TablesOfFigures) { $t.Update() | Out-Null }
    $doc.Repaginate()
  }
  $doc.Save()
  if ($Pdf) { $doc.ExportAsFixedFormat([System.IO.Path]::GetFullPath($Pdf), 17) }
  "Listo: $ruta - " + $doc.ComputeStatistics(2) + " paginas"
  $doc.Close($false)
}
finally { $word.Quit() }

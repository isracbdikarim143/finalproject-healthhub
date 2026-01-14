# Fix function parameter types that weren't caught by regex

$files = Get-ChildItem -Path "src" -Include "*.jsx","*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix ({ children }: { children: ReactNode }) -> ({ children })
    $content = $content -replace '\(\{\s*(\w+)\s*\}\s*:\s*\{[^}]+\}\)', '({ $1 })'
    
    # Fix ({ prop1, prop2 }: Type) -> ({ prop1, prop2 })
    $content = $content -replace '\(\{\s*([^}]+)\}\s*:\s*\w+\)', '({ $1 })'
    
    # Fix (param: Type) -> (param)
    $content = $content -replace '\((\w+)\s*:\s*[^\)]+\)', '($1)'
    
    # Fix (e: React.ChangeEvent<...>) -> (e)
    $content = $content -replace '\((\w+)\s*:\s*React\.[^\)]+\)', '($1)'
    
    # Remove any remaining type annotations after colons
    $content = $content -replace ':\s*[A-Z][\w<>\.]+(?=\s*[,\)\{])', ''
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "Function parameter fixes complete!"

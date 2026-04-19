import os
import requests
from dotenv import load_dotenv

# --- CONFIGURACIÓN DE CREDENCIALES ---
load_dotenv()

DOJO_URL = os.getenv("DOJO_URL")
DOJO_TOKEN = os.getenv("DOJO_TOKEN")
GITHUB_API = os.getenv("GITHUB_API")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not all([DOJO_URL, DOJO_TOKEN, GITHUB_API, GITHUB_TOKEN]):
    raise ValueError("❌ Faltan variables de entorno. Revisa tu archivo .env")

def get_dojo_findings():
    print("Buscando vulnerabilidades en DefectDojo...")
    headers = {
        "Authorization": f"Token {DOJO_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Buscamos solo las activas, que no estén mitigadas y que no se dupliquen
    params = {
        "active": "true",
        "duplicate": "false"
    }
    
    response = requests.get(f"{DOJO_URL}/findings/", headers=headers, params=params)
    response.raise_for_status()
    return response.json()["results"]

def create_github_issue(finding):
    print(f"Creando Issue en GitHub para: {finding['title']}")
    
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Construimos el cuerpo de la Issue en GitHub
    issue_data = {
        "title": f"[Security] {finding['title']}",
        "body": f"### Vulnerabilidad detectada por DefectDojo\n\n"
                f"**Severidad:** {finding['severity']}\n"
                f"**Archivo afectado:** `{finding.get('file_path', 'No especificado')}`\n\n"
                f"**Descripción:**\n{finding['description']}\n\n"
                f"**Mitigación recomendada:**\n{finding.get('mitigation', 'Revisar código fuente.')}\n\n"
                f"---\n*Nota: ID interno de DefectDojo: {finding['id']}*",
        "labels": ["security", "bug"]
    }
    
    response = requests.post(f"{GITHUB_API}/issues", headers=headers, json=issue_data)
    
    if response.status_code == 201:
        print(f"✅ Issue creada con éxito: {response.json()['html_url']}")
        return True
    else:
        print(f"❌ Error al crear la Issue: {response.text}")
        return False
        
def mark_finding_as_synced(finding_id, current_tags):
    print(f"Marcando Finding {finding_id} como sincronizado en DefectDojo...")
    
    headers = {
        "Authorization": f"Token {DOJO_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # 1. Juntamos los tags que ya tuviera la vulnerabilidad con el nuestro nuevo
    new_tags = current_tags + ["enviado-a-github"]
    
    # 2. Preparamos el JSON solo con el campo que queremos parchear
    patch_data = {
        "tags": new_tags
    }
    
    # 3. Hacemos la petición PATCH a la URL específica de ese Finding
    response = requests.patch(
        f"{DOJO_URL}/findings/{finding_id}/", 
        headers=headers, 
        json=patch_data
    )
    
    if response.status_code == 200:
        print("✅ Etiqueta añadida en DefectDojo correctamente.")
    else:
        print(f"❌ Error al actualizar DefectDojo: {response.text}")

# --- EJECUCIÓN DEL SCRIPT ---
if __name__ == "__main__":
    findings = get_dojo_findings()
    
    if not findings:
        print("¡Buenas noticias! No hay vulnerabilidades críticas activas.")
    
    for finding in findings:
        current_tags = finding.get("tags", [])
        
        # Filtro Anti-Duplicados: Si ya tiene la etiqueta, lo saltamos
        if "enviado-a-github" in current_tags:
            print(f"⏩ Saltando: '{finding['title']}' (Ya tiene Issue en GitHub)")
            continue
            
        # Si no la tiene, intentamos crear la Issue
        issue_creada = create_github_issue(finding)
        
        # Si GitHub responde con OK, parcheamos DefectDojo
        if issue_creada:
            mark_finding_as_synced(finding["id"], current_tags)
            print("-" * 40)
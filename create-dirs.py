import os

base_path = r'C:\Users\leona\Desktop\ProjetoDormeAqui\front-end\src\components\dashboard'
dirs = ['utils', 'hooks', 'atoms', 'sections', 'styles']

for dir_name in dirs:
    full_path = os.path.join(base_path, dir_name)
    os.makedirs(full_path, exist_ok=True)
    print(f'✓ Criado/Verificado: {full_path}')

print('\n✓ Todos os diretórios foram processados com sucesso!')

# Kubernetes манифесты

## Структура

```
infra/k8s/
├── namespaces/           # Namespaces
├── deployments/          # Application deployments
├── services/             # Services и Load Balancers
├── ingress/              # Ingress конфигурации
├── configmaps/           # Configuration maps
├── secrets/              # Secrets (не в git!)
└── storage/              # Persistent volumes
```

## Применение

### Создание namespace
```bash
kubectl apply -f infra/k8s/namespaces/
```

### Развертывание приложений
```bash
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
kubectl apply -f infra/k8s/ingress/
```

### Проверка статуса
```bash
kubectl get pods -n childdev
kubectl get services -n childdev
kubectl logs -f deployment/web -n childdev
```

## Компоненты

### Applications
- **web-deployment.yaml** - Next.js фронтенд (3 реплики)
- **pdf-deployment.yaml** - PDF сервис (2 реплики)  
- **api-deployment.yaml** - Core API (2 реплики)

### Data layer
- **postgres-deployment.yaml** - PostgreSQL (1 реплика + PVC)
- **redis-deployment.yaml** - Redis (1 реплика)

### Infrastructure  
- **ingress-nginx.yaml** - Ingress controller
- **cert-manager.yaml** - SSL сертификаты

## Масштабирование

```bash
# Увеличение количества pod'ов
kubectl scale deployment web --replicas=5 -n childdev

# Горизонтальное автомасштабирование  
kubectl autoscale deployment pdf --cpu-percent=70 --min=2 --max=10 -n childdev
```

## Мониторинг

```bash
# Ресурсы
kubectl top pods -n childdev
kubectl top nodes

# События
kubectl get events -n childdev --sort-by='.lastTimestamp'
```

Конфигурации будут добавлены при переходе на Kubernetes (фаза 3).

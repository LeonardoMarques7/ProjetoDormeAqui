import { useNotification } from "@/components/contexts/NotificationContext";
import { useNotificationTemplates } from "@/components/common/NotificationTemplate";
import { Button } from "@mantine/core";
import { useEffect } from "react";

/**
 * COMPONENTE DE TESTE - NotificationDemo
 * 
 * Este componente demonstra todas as funcionalidades do novo sistema
 * de notificações. Ele pode ser importado temporariamente em qualquer
 * página para testar os diferentes tipos de notificação.
 * 
 * Uso:
 * import NotificationDemo from "@/components/notifications/NotificationDemo";
 * 
 * Depois adicione em qualquer componente:
 * <NotificationDemo />
 */

const NotificationDemo = () => {
  const { addNotification, getUnreadCount } = useNotification();
  const templates = useNotificationTemplates(addNotification);

  useEffect(() => {
    // Opcionalmente, mostrar uma notificação de boas-vindas ao montar
    // templates.showWelcome();
  }, []);

  const handleSuccessNotification = () => {
    addNotification({
      title: "✅ Sucesso!",
      message: "A operação foi realizada com sucesso.",
      type: "success",
      icon: "✅",
    });
  };

  const handleErrorNotification = () => {
    addNotification({
      title: "❌ Erro",
      message: "Ocorreu um erro ao processar sua solicitação.",
      type: "error",
      icon: "❌",
    });
  };

  const handleWarningNotification = () => {
    addNotification({
      title: "⚠️ Atenção",
      message: "Verifique este item antes de continuar.",
      type: "warning",
      icon: "⚠️",
    });
  };

  const handleReservationTemplate = () => {
    templates.showReservationConfirmed();
  };

  const handleWelcomeTemplate = () => {
    templates.showWelcome();
  };

  const handlePaymentTemplate = () => {
    templates.showPaymentSuccess();
  };

  const handleCustomNotification = () => {
    addNotification({
      title: "🎨 Notificação Customizada",
      message: "Você pode criar qualquer notificação que quiser!",
      type: "platform",
      icon: "🎨",
      actions: [
        {
          id: "action_1",
          label: "Primária",
          primary: true,
          onClick: () => {
            console.log("Ação primária clicada");
          },
        },
        {
          id: "action_2",
          label: "Secundária",
          onClick: () => {
            console.log("Ação secundária clicada");
          },
        },
      ],
    });
  };

  const handleMultipleNotifications = () => {
    addNotification({
      title: "1️⃣ Primeira",
      message: "Primeira notificação",
      type: "info",
    });

    setTimeout(() => {
      addNotification({
        title: "2️⃣ Segunda",
        message: "Segunda notificação após 500ms",
        type: "system",
      });
    }, 500);

    setTimeout(() => {
      addNotification({
        title: "3️⃣ Terceira",
        message: "Terceira notificação após 1s",
        type: "success",
      });
    }, 1000);
  };

  const handleReminder = () => {
    templates.showReservationReminder5Days();
  };

  const handleAccommodationCreated = () => {
    templates.showAccommodationCreated();
  };

  const handleLogout = () => {
    templates.showLogoutSuccess();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-6 max-w-md z-40 border border-gray-200">
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-gray-900">
          🧪 Teste de Notificações
        </h3>
        <p className="text-sm text-gray-600">
          Clique nos botões abaixo para testar o sistema.
          <br />
          Contador: {getUnreadCount()} não lidas
        </p>

        <div className="space-y-2 text-sm">
          {/* Tipos Básicos */}
          <div className="border-t pt-2">
            <p className="font-semibold text-gray-700 mb-2">Tipos Básicos:</p>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={handleSuccessNotification}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                ✅ Sucesso
              </button>
              <button
                onClick={handleErrorNotification}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                ❌ Erro
              </button>
              <button
                onClick={handleWarningNotification}
                className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
              >
                ⚠️ Aviso
              </button>
              <button
                onClick={() =>
                  addNotification({
                    title: "ℹ️ Info",
                    message: "Informação",
                    type: "info",
                  })
                }
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                ℹ️ Info
              </button>
            </div>
          </div>

          {/* Templates */}
          <div className="border-t pt-2">
            <p className="font-semibold text-gray-700 mb-2">Templates:</p>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={handleWelcomeTemplate}
                className="px-2 py-1 bg-pink-500 text-white rounded text-xs hover:bg-pink-600"
              >
                👋 Welcome
              </button>
              <button
                onClick={handleReservationTemplate}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
              >
                🎉 Reserva
              </button>
              <button
                onClick={handlePaymentTemplate}
                className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
              >
                💳 Pagamento
              </button>
              <button
                onClick={handleReminder}
                className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
              >
                📅 Lembrete
              </button>
              <button
                onClick={handleAccommodationCreated}
                className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
              >
                🏠 Casa
              </button>
              <button
                onClick={handleLogout}
                className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              >
                👋 Logout
              </button>
            </div>
          </div>

          {/* Customizadas */}
          <div className="border-t pt-2">
            <p className="font-semibold text-gray-700 mb-2">Avançadas:</p>
            <div className="space-y-1">
              <button
                onClick={handleCustomNotification}
                className="w-full px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              >
                🎨 Com Ações
              </button>
              <button
                onClick={handleMultipleNotifications}
                className="w-full px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
              >
                🔔 Múltiplas (sequencial)
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 border-t pt-2">
          💡 Clique no sino no topo para ver o histórico
        </p>
      </div>
    </div>
  );
};

export default NotificationDemo;

/**
 * COMO USAR EM DESENVOLVIMENTO:
 * 
 * 1. Importe este componente em qualquer página/componente:
 *    import NotificationDemo from "@/components/common/NotificationDemo";
 * 
 * 2. Adicione ao JSX:
 *    <NotificationDemo />
 * 
 * 3. Agora você terá um painel flutuante com botões de teste
 * 
 * 4. Remova quando não precisar mais!
 * 
 * TESTES RECOMENDADOS:
 * - Clique em cada tipo básico (sucesso, erro, aviso, info)
 * - Teste os templates (bem-vindo, reserva, pagamento)
 * - Envie múltiplas notificações
 * - Clique no sino para ver o histórico
 * - Teste marcar como lido, deletar, limpar tudo
 * - Verifique a persistência atualizando a página
 * - Teste o responsivo em mobile
 * - Verifique as animações com Framer Motion
 */

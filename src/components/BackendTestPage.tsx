import React, { useState, useEffect } from 'react';
import { useLiveKitStore } from '../stores/liveKitStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useAuthStore } from '../stores/authStore';
import { Loader2, CheckCircle, Clock, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

// Конфигурации тестовых сценариев
const TEST_SCENARIOS = {
    PREMIUM_WITH_ALL_PERMISSIONS: {
        name: 'Premium + Все разрешения',
        description: 'Премиум активен, все разрешения (microphone, location, push, apple_music) включены',
        premium: true,
        permissions: {
            microphone: true,
            location: true,
            push: true,
            apple_music: true
        }
    },
    PREMIUM_WITHOUT_MIC_LOCATION: {
        name: 'Premium без mic/location',
        description: 'Премиум активен, но microphone и location отключены (нужен запрос разрешений)',
        premium: true,
        permissions: {
            microphone: false,
            location: false,
            push: true,
            apple_music: true
        }
    }
};

interface TestStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed';
    error?: string;
    expectedPayload?: any;
    actualPayload?: any;
}

interface TestSuite {
    id: string;
    name: string;
    description: string;
    steps: TestStep[];
    status: 'pending' | 'running' | 'passed' | 'failed';
}

export const BackendTestPage: React.FC = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [currentTestSuite, setCurrentTestSuite] = useState<TestSuite | null>(null);
    const [testResults, setTestResults] = useState<TestSuite[]>([]);

    const {
        isConnected,
        isConnecting,
        connect,
        disconnect,
        connectionState
    } = useLiveKitStore();

    const {
        receivedRpcCommands,
        sentRpcCommands,
        permissions,
        setPermission,
        sendPermissionsResponse,
        error
    } = useOnboardingStore();

    const { premium, setPremium } = useAuthStore();

    // Создаем тест-сьют для премиум флоу
    const createPremiumFlowTestSuite = (): TestSuite => ({
        id: 'premium-flow',
        name: 'Premium Flow Test',
        description: `Тестирует флоу подключения с конфигурацией: ${TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.name} (${TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.description})`,
        status: 'pending',
        steps: [
            {
                id: 'connect',
                name: 'Подключение к бэкенду',
                description: 'Подключение к LiveKit комнате',
                status: 'pending'
            },
            {
                id: 'get-premium',
                name: 'Проверка премиум статуса',
                description: 'Бэкенд запрашивает get-premium, ожидается true',
                status: 'pending',
                expectedPayload: { premium: true }
            },
            {
                id: 'get-permissions',
                name: 'Запрос разрешений',
                description: 'Бэкенд запрашивает get-permissions, ожидается подтверждение всех разрешений',
                status: 'pending',
                expectedPayload: {
                    microphone: true,
                    location: true,
                    push: true,
                    apple_music: true
                }
            },
            {
                id: 'show-screen-main',
                name: 'Показ главного экрана',
                description: 'Бэкенд отправляет show-screen с main экраном',
                status: 'pending',
                expectedPayload: {
                    screen_type: 'main',
                    use_microphone: true,
                    data: {
                        text: 'How can I help you?',
                        buttons: [
                            {
                                text: 'Navigate',
                                icon_url: 'https://cdn.ray-a.pl/va/main-navigation.svg',
                                rpc_on_click: { name: 'navigate' }
                            },
                            {
                                text: 'Play music',
                                icon_url: 'https://cdn.ray-a.pl/va/main-note.svg',
                                rpc_on_click: { name: 'music' }
                            }
                        ]
                    },
                    avatar_state: { input: 'Idle' },
                    analytics: { event: { name: 'Main Screen Open' } }
                }
            }
        ]
    });

    // Создаем тест-сьют для запроса разрешений при старте (микрофон/локация = false)
    const createRequestPermissionsFlowTestSuite = (): TestSuite => ({
        id: 'request-permissions-flow',
        name: 'Request Permissions Flow Test',
        description: `Тестирует флоу запроса разрешений с конфигурацией: ${TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.name} (${TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.description}). Ждем request_permissions экран, эмулируем Continue, затем main screen`,
        status: 'pending',
        steps: [
            { id: 'connect', name: 'Подключение к бэкенду', description: 'Подключение к LiveKit комнате', status: 'pending' },
            { id: 'request-permissions-screen', name: 'Экран запроса разрешений', description: 'Ожидается show-screen: request_permissions с корректным payload', status: 'pending' },
            { id: 'continue', name: 'Эмуляция нажатия Continue', description: 'Выдаем разрешения и отправляем rpc_on_allow', status: 'pending' },
            { id: 'show-screen-main', name: 'Показ главного экрана', description: 'После Continue приходит show-screen main', status: 'pending' }
        ]
    });

    const handleLogout = () => {
        disconnect();
        setTestResults([]);
        setCurrentTestSuite(null);
    };

    const resetTestSuite = (suite: TestSuite): TestSuite => ({
        ...suite,
        status: 'pending',
        steps: suite.steps.map(step => ({ ...step, status: 'pending', error: undefined, actualPayload: undefined }))
    });

    const updateTestStep = (suiteId: string, stepId: string, updates: Partial<TestStep>) => {
        setTestResults(prev => prev.map(suite => {
            if (suite.id === suiteId) {
                return {
                    ...suite,
                    steps: suite.steps.map(step =>
                        step.id === stepId ? { ...step, ...updates } : step
                    )
                };
            }
            return suite;
        }));

        if (currentTestSuite?.id === suiteId) {
            setCurrentTestSuite(prev => {
                if (!prev || prev.id !== suiteId) return prev;
                return {
                    ...prev,
                    steps: prev.steps.map(step =>
                        step.id === stepId ? { ...step, ...updates } : step
                    )
                };
            });
        }
    };

    const updateTestSuiteStatus = (suiteId: string, status: TestSuite['status']) => {
        setTestResults(prev => prev.map(suite =>
            suite.id === suiteId ? { ...suite, status } : suite
        ));

        if (currentTestSuite?.id === suiteId) {
            setCurrentTestSuite(prev => prev ? { ...prev, status } : null);
        }
    };

    const runTestSuite = async (suite: TestSuite, manageRunningFlag: boolean = true) => {
        console.log('🚀 Starting test suite:', suite.name);
        console.log('🔍 Current connection state:', isConnected);
        console.log('🔍 Current running state:', isRunning);

        const resetSuite = resetTestSuite(suite);
        setCurrentTestSuite(resetSuite);
        setTestResults(prev => [resetSuite, ...prev.filter(s => s.id !== suite.id)]);

        if (manageRunningFlag) {
            setIsRunning(true);
        }
        updateTestSuiteStatus(suite.id, 'running');

        try {
            // Устанавливаем конфигурацию для премиум флоу
            console.log('🔧 Setting test configuration:', TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.name);
            useAuthStore.getState().setPremium(TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.premium);
            useOnboardingStore.setState((state) => ({
                permissions: TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.permissions
            }));

            // Шаг 1: Подключение
            updateTestStep(suite.id, 'connect', { status: 'running' });

            // Всегда отключаемся сначала, если подключены
            const { isConnected: currentConnected } = useLiveKitStore.getState();
            if (currentConnected) {
                console.log('🔄 Disconnecting before test...');
                await disconnect();
                // Ждем отключения
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Очищаем предыдущие RPC команды и ошибки
            console.log('🧹 Clearing previous RPC commands and errors...');
            const { clearReceivedRpcCommands, clearSentRpcCommands } = useOnboardingStore.getState();
            // Очищаем массивы команд и ошибки
            useOnboardingStore.setState({
                receivedRpcCommands: [],
                sentRpcCommands: [],
                error: null
            });

            // Запускаем ожидание RPC команд ПЕРЕД подключением
            console.log('🚀 Starting RPC command watchers...');
            const premiumPromise = waitForRpcCommand('get-premium', 15000);
            const permissionsPromise = waitForRpcCommand('get-permissions', 15000);
            const showScreenPromise = waitForShowScreenCommand('main', 15000);

            try {
                console.log('🔄 Connecting for test...');
                await connect('assistant-room', true);
                // Ждем подключения с таймаутом
                await new Promise((resolve, reject) => {
                    const startTime = Date.now();
                    const timeout = 15000; // 15 секунд

                    const checkConnection = () => {
                        const { isConnected: currentConnected } = useLiveKitStore.getState();
                        if (currentConnected) {
                            resolve(true);
                            return;
                        }

                        if (Date.now() - startTime > timeout) {
                            reject(new Error('Timeout: подключение не установлено в течение 15 секунд'));
                            return;
                        }

                        setTimeout(checkConnection, 100);
                    };
                    checkConnection();
                });
            } catch (error) {
                updateTestStep(suite.id, 'connect', {
                    status: 'failed',
                    error: `Ошибка подключения: ${(error as Error).message}`
                });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }

            updateTestStep(suite.id, 'connect', { status: 'passed' });

            // Создаем промис для отслеживания RPC ошибок через polling
            let watcherStopped = false;
            const createRpcErrorWatcher = () => {
                return new Promise<never>((_, reject) => {
                    let checkCount = 0;
                    const checkError = () => {
                        if (watcherStopped) {
                            console.log('🛑 [Premium Flow] RPC Error watcher stopped');
                            return;
                        }
                        const error = useOnboardingStore.getState().error;
                        checkCount++;
                        if (checkCount % 10 === 0) {
                            console.log(`🔍 [Premium Flow] RPC Error watcher check #${checkCount}, error:`, error);
                        }
                        if (error) {
                            console.log('❌ [Premium Flow] RPC Error detected in watcher:', error);
                            reject(new Error(error));
                            return;
                        }
                        setTimeout(checkError, 100);
                    };
                    checkError();
                });
            };

            const rpcErrorWatcher = createRpcErrorWatcher();

            // Шаг 2: Ожидание get-premium
            updateTestStep(suite.id, 'get-premium', { status: 'running' });
            const premiumReceived = await Promise.race([
                premiumPromise,
                rpcErrorWatcher
            ]);
            if (premiumReceived) {
                updateTestStep(suite.id, 'get-premium', {
                    status: 'passed',
                    actualPayload: premiumReceived
                });
            } else {
                updateTestStep(suite.id, 'get-premium', {
                    status: 'failed',
                    error: 'Timeout: get-premium не получен в течение 15 секунд'
                });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }

            // Шаг 3: Ожидание get-permissions
            updateTestStep(suite.id, 'get-permissions', { status: 'running' });
            const permissionsReceived = await Promise.race([
                permissionsPromise,
                rpcErrorWatcher
            ]);
            if (permissionsReceived) {
                updateTestStep(suite.id, 'get-permissions', {
                    status: 'passed',
                    actualPayload: permissionsReceived
                });
            } else {
                updateTestStep(suite.id, 'get-permissions', {
                    status: 'failed',
                    error: 'Timeout: get-permissions не получен в течение 15 секунд'
                });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }

            // Шаг 4: Ожидание show-screen с main экраном
            updateTestStep(suite.id, 'show-screen-main', { status: 'running' });
            const showScreenReceived = await Promise.race([
                showScreenPromise,
                rpcErrorWatcher
            ]);
            if (showScreenReceived) {
                updateTestStep(suite.id, 'show-screen-main', {
                    status: 'passed',
                    actualPayload: showScreenReceived
                });
            } else {
                updateTestStep(suite.id, 'show-screen-main', {
                    status: 'failed',
                    error: 'Timeout: show-screen с main экраном не получен в течение 15 секунд'
                });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }

            updateTestSuiteStatus(suite.id, 'passed');

        } catch (error) {
            console.error('Test suite failed:', error);
            updateTestSuiteStatus(suite.id, 'failed');
        } finally {
            // Останавливаем watcher
            watcherStopped = true;

            // Отключаемся в конце теста
            try {
                console.log('🔄 Disconnecting after test...');
                await disconnect();
            } catch (disconnectError) {
                console.warn('⚠️ Error during disconnect:', disconnectError);
            }
            if (manageRunningFlag) {
                setIsRunning(false);
            }
        }
    };

    // Ожидание появления permission popup данных в сторе
    const waitForPermissionPopup = (timeout: number): Promise<any> => {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const check = () => {
                const popup = useOnboardingStore.getState().permissionPopupData;
                if (popup) {
                    resolve(popup);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    resolve(null);
                    return;
                }
                setTimeout(check, 100);
            };
            check();
        });
    };

    // Запуск теста флоу запроса разрешений
    // Функция для запуска всех тестов последовательно
    const runAllTests = async () => {
        console.log('🚀 Starting all tests sequentially...');
        setIsRunning(true);

        const allTestSuites = [
            createPremiumFlowTestSuite(),
            createRequestPermissionsFlowTestSuite()
        ];

        try {
            for (let i = 0; i < allTestSuites.length; i++) {
                const suite = allTestSuites[i];
                console.log(`📋 Running test ${i + 1}/${allTestSuites.length}: ${suite.name}`);

                try {
                    if (suite.id === 'premium-flow') {
                        await runTestSuite(suite, false);
                    } else if (suite.id === 'request-permissions-flow') {
                        await runRequestPermissionsFlow(suite, false);
                    }

                    // Небольшая пауза между тестами
                    if (i < allTestSuites.length - 1) {
                        console.log('⏳ Waiting 2 seconds before next test...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } catch (error) {
                    console.error(`❌ Test ${suite.name} failed:`, error);
                    // Продолжаем выполнение остальных тестов
                }
            }

            console.log('✅ All tests completed');
        } finally {
            setIsRunning(false);
        }
    };

    const runRequestPermissionsFlow = async (suite: TestSuite, manageRunningFlag: boolean = true) => {
        console.log('🚀 Starting test suite:', suite.name);

        const resetSuite = resetTestSuite(suite);
        setCurrentTestSuite(resetSuite);
        setTestResults(prev => [resetSuite, ...prev.filter(s => s.id !== suite.id)]);

        if (manageRunningFlag) {
            setIsRunning(true);
        }
        updateTestSuiteStatus(suite.id, 'running');

        try {
            // Устанавливаем конфигурацию для теста запроса разрешений
            console.log('🔧 Setting test configuration:', TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.name);
            useAuthStore.getState().setPremium(TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.premium);
            useOnboardingStore.setState((state) => ({
                permissions: TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.permissions
            }));

            // Шаг 1: Подключение
            updateTestStep(suite.id, 'connect', { status: 'running' });

            const { isConnected: alreadyConnected } = useLiveKitStore.getState();
            if (alreadyConnected) {
                await disconnect();
                await new Promise(r => setTimeout(r, 800));
            }

            // Очистка истории RPC и ошибок
            useOnboardingStore.setState({ receivedRpcCommands: [], sentRpcCommands: [], error: null });

            // Вотчеры
            const requestPermissionsScreenPromise = waitForShowScreenCommand('request_permissions', 20000);
            const mainScreenPromise = waitForShowScreenCommand('main', 20000);

            // Подключаемся
            await connect('assistant-room', true);
            await new Promise((resolve, reject) => {
                const start = Date.now();
                const timeout = 15000;
                const tick = () => {
                    if (useLiveKitStore.getState().isConnected) return resolve(true);
                    if (Date.now() - start > timeout) return reject(new Error('Timeout: подключение не установлено'));
                    setTimeout(tick, 100);
                };
                tick();
            });
            updateTestStep(suite.id, 'connect', { status: 'passed' });

            // Создаем промис для отслеживания RPC ошибок через polling
            let watcherStopped = false;
            const createRpcErrorWatcher = () => {
                return new Promise<never>((_, reject) => {
                    let checkCount = 0;
                    const checkError = () => {
                        if (watcherStopped) {
                            console.log('🛑 [Request Permissions Flow] RPC Error watcher stopped');
                            return;
                        }
                        const error = useOnboardingStore.getState().error;
                        checkCount++;
                        if (checkCount % 10 === 0) {
                            console.log(`🔍 [Request Permissions Flow] RPC Error watcher check #${checkCount}, error:`, error);
                        }
                        if (error) {
                            console.log('❌ [Request Permissions Flow] RPC Error detected in watcher:', error);
                            reject(new Error(error));
                            return;
                        }
                        setTimeout(checkError, 100);
                    };
                    checkError();
                });
            };

            const rpcErrorWatcher = createRpcErrorWatcher();

            // Ждем экрана запроса разрешений (show-screen: request_permissions)
            updateTestStep(suite.id, 'request-permissions-screen', { status: 'running' });
            const requestPermissionsScreen = await Promise.race([
                requestPermissionsScreenPromise,
                rpcErrorWatcher
            ]);
            if (!requestPermissionsScreen) {
                updateTestStep(suite.id, 'request-permissions-screen', { status: 'failed', error: 'Timeout: show-screen request_permissions не получен' });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }

            // Валидация payload
            const validateRequestPermissionsPayload = (p: any): { ok: boolean; error?: string } => {
                if (p.screen_type !== 'request_permissions') return { ok: false, error: "Некорректный screen_type" };
                if (p.use_microphone !== false) return { ok: false, error: "use_microphone должен быть false" };
                if (!p.data || !Array.isArray(p.data.permissions)) return { ok: false, error: "Нет массива data.permissions" };
                const types = p.data.permissions.map((x: any) => x.type).sort();
                const hasMic = p.data.permissions.find((x: any) => x.type === 'microphone');
                const hasLoc = p.data.permissions.find((x: any) => x.type === 'location');
                if (!hasMic || !hasLoc) return { ok: false, error: `Нужны permissions: microphone и location (есть: ${types.join(', ')})` };
                const checkAction = (perm: any) => perm?.rpc_on_allow?.name === 'permission-allow' && perm?.rpc_on_deny?.name === 'permission-deny';
                if (!checkAction(hasMic) || !checkAction(hasLoc)) return { ok: false, error: 'rpc_on_allow/deny имеют неверные имена' };
                const btn = p.data.buttons?.[0];
                if (!btn || btn.rpc_on_click?.name !== 'dispatcher') return { ok: false, error: 'Кнопка Continue отсутствует или rpc_on_click.name != dispatcher' };
                return { ok: true };
            };

            const validation = validateRequestPermissionsPayload(requestPermissionsScreen);
            if (!validation.ok) {
                updateTestStep(suite.id, 'request-permissions-screen', { status: 'failed', error: `Неверный payload: ${validation.error}` });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }
            updateTestStep(suite.id, 'request-permissions-screen', { status: 'passed', actualPayload: requestPermissionsScreen });

            // Эмулируем нажатие Continue
            updateTestStep(suite.id, 'continue', { status: 'running' });
            try {
                // Включаем все запрошенные разрешения и отправляем rpc_on_click dispatcher
                const screen = requestPermissionsScreen;
                const perms = screen.data?.permissions || [];
                for (const perm of perms) {
                    const t = perm.type as 'microphone' | 'location' | 'push' | 'apple_music';
                    if (t === 'microphone' || t === 'location' || t === 'push' || t === 'apple_music') {
                        await useOnboardingStore.getState().setPermission(t, true);
                    }
                }
                const continueAction = screen.data?.buttons?.[0]?.rpc_on_click;
                if (continueAction) {
                    try {
                        await useOnboardingStore.getState().handleRpcMethod(continueAction.name, continueAction.payload || null);
                    } catch (rpcError) {
                        console.error('❌ RPC Error during Continue:', rpcError);
                        throw new Error(`RPC Error: ${(rpcError as Error).message}`);
                    }
                }
                updateTestStep(suite.id, 'continue', { status: 'passed' });
            } catch (e) {
                updateTestStep(suite.id, 'continue', { status: 'failed', error: `Ошибка эмуляции Continue: ${(e as Error).message}` });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }

            // Ждем главного экрана
            updateTestStep(suite.id, 'show-screen-main', { status: 'running' });
            const mainScreen = await Promise.race([
                mainScreenPromise,
                rpcErrorWatcher
            ]);
            if (!mainScreen) {
                updateTestStep(suite.id, 'show-screen-main', { status: 'failed', error: 'Timeout: main screen не получен' });
                updateTestSuiteStatus(suite.id, 'failed');
                return;
            }
            updateTestStep(suite.id, 'show-screen-main', { status: 'passed', actualPayload: mainScreen });

            updateTestSuiteStatus(suite.id, 'passed');
        } catch (error) {
            console.error('Test suite failed:', error);
            updateTestSuiteStatus(suite.id, 'failed');
        } finally {
            // Останавливаем watcher
            watcherStopped = true;

            try { await disconnect(); } catch { }
            if (manageRunningFlag) {
                setIsRunning(false);
            }
        }
    };

    const waitForRpcCommand = (method: string, timeout: number): Promise<any> => {
        return new Promise((resolve) => {
            const startTime = Date.now();
            console.log(`🔍 Waiting for RPC command: ${method}`);

            const checkCommand = () => {
                // Читаем актуальное состояние напрямую из store
                const currentCommands = useOnboardingStore.getState().receivedRpcCommands;
                const command = currentCommands.find(cmd => cmd.method === method);
                console.log(`🔍 Current RPC commands array length:`, currentCommands.length);
                console.log(`🔍 Current RPC commands:`, currentCommands.map(cmd => `${cmd.method} at ${cmd.timestamp.toLocaleTimeString()}`));
                console.log(`🔍 Looking for method: ${method}`);

                if (command) {
                    console.log(`✅ Found RPC command: ${method}`, command.data);
                    resolve(command.data);
                    return;
                }

                const elapsed = Date.now() - startTime;
                if (elapsed > timeout) {
                    console.log(`❌ Timeout waiting for RPC command: ${method} (${elapsed}ms)`);
                    resolve(null);
                    return;
                }

                setTimeout(checkCommand, 100);
            };

            checkCommand();
        });
    };

    const waitForShowScreenCommand = (screenType: string, timeout: number): Promise<any> => {
        return new Promise((resolve) => {
            const startTime = Date.now();
            console.log(`🔍 Waiting for show-screen command: ${screenType}`);

            const checkCommand = () => {
                // Читаем актуальное состояние напрямую из store
                const currentCommands = useOnboardingStore.getState().receivedRpcCommands;
                const command = currentCommands.find(cmd =>
                    cmd.method === 'show-screen' && cmd.data?.screen_type === screenType
                );
                console.log(`🔍 Current RPC commands:`, currentCommands.map(cmd =>
                    `${cmd.method} (${cmd.data?.screen_type || 'no screen_type'}) at ${cmd.timestamp.toLocaleTimeString()}`
                ));

                if (command) {
                    console.log(`✅ Found show-screen command: ${screenType}`, command.data);
                    resolve(command.data);
                    return;
                }

                const elapsed = Date.now() - startTime;
                if (elapsed > timeout) {
                    console.log(`❌ Timeout waiting for show-screen command: ${screenType} (${elapsed}ms)`);
                    resolve(null);
                    return;
                }

                setTimeout(checkCommand, 100);
            };

            checkCommand();
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'text-green-600 bg-green-50 border-green-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Тестирование бэкенда</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        Выйти
                    </button>
                </div>

                {/* Статус подключения */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Статус подключения</h2>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${connectionState.status === 'connected'
                            ? 'bg-green-100 text-green-800'
                            : connectionState.status === 'connecting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {connectionState.status === 'connected' && <CheckCircle className="inline w-4 h-4 mr-1" />}
                            {connectionState.status === 'connecting' && <Loader2 className="inline w-4 h-4 mr-1 animate-spin" />}
                            {connectionState.status === 'disconnected' && <AlertCircle className="inline w-4 h-4 mr-1" />}
                            {connectionState.status}
                        </div>
                        {connectionState.roomName && (
                            <span className="text-sm text-gray-600">Комната: {connectionState.roomName}</span>
                        )}
                        {isRunning && (
                            <span className="text-sm text-blue-600 font-medium">
                                🔄 Тест выполняется...
                            </span>
                        )}
                    </div>
                </div>

                {/* Конфигурации тестов */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Конфигурации тестов</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2 text-blue-600">{TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.description}</p>
                            <div className="space-y-1">
                                <div className="text-sm">
                                    <span className="font-medium">Premium:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.premium ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.premium ? 'Включен' : 'Отключен'}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Разрешения:</span>
                                    <div className="ml-2 mt-1 space-y-1">
                                        {Object.entries(TEST_SCENARIOS.PREMIUM_WITH_ALL_PERMISSIONS.permissions).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="text-xs">{key}:</span>
                                                <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {value ? 'Включено' : 'Отключено'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-2 text-purple-600">{TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.description}</p>
                            <div className="space-y-1">
                                <div className="text-sm">
                                    <span className="font-medium">Premium:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.premium ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.premium ? 'Включен' : 'Отключен'}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Разрешения:</span>
                                    <div className="ml-2 mt-1 space-y-1">
                                        {Object.entries(TEST_SCENARIOS.PREMIUM_WITHOUT_MIC_LOCATION.permissions).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="text-xs">{key}:</span>
                                                <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {value ? 'Включено' : 'Отключено'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            ℹ️ Тесты автоматически устанавливают нужные конфигурации перед запуском. Настройки выше используются только для ручного тестирования.
                        </p>
                    </div>
                </div>

                {/* Настройки для ручного тестирования */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Настройки для ручного тестирования</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Премиум статус</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="premium-status"
                                    checked={premium}
                                    onChange={(e) => setPremium(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="premium-status" className="text-sm font-medium text-gray-900">
                                    Premium активен
                                </label>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Разрешения</h3>
                            <div className="space-y-2">
                                {Object.entries(permissions).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={key}
                                            checked={value}
                                            onChange={(e) => setPermission(key as any, e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={key} className="text-sm font-medium text-gray-900">
                                            {key}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Панель ошибок RPC */}
                <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-2">Состояние RPC</h2>
                    {error ? (
                        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded p-3">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <div className="text-sm">
                                <div className="font-medium">Ошибка RPC:</div>
                                <div className="break-all">{error}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">Ошибок RPC нет</div>
                    )}
                </div>

                {/* Управление тестами */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Управление тестами</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => runTestSuite(createPremiumFlowTestSuite())}
                            disabled={isRunning}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Запустить Premium Flow Test
                        </button>
                        <button
                            onClick={() => runRequestPermissionsFlow(createRequestPermissionsFlowTestSuite())}
                            disabled={isRunning}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Запустить Request Permissions Flow
                        </button>
                        <button
                            onClick={runAllTests}
                            disabled={isRunning}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Запустить все тесты
                        </button>
                        <button
                            onClick={() => {
                                setTestResults([]);
                                setCurrentTestSuite(null);
                            }}
                            disabled={isRunning}
                            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Очистить результаты
                        </button>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            ℹ️ Тесты автоматически подключаются к бэкенду в начале и отключаются в конце
                        </p>
                    </div>
                </div>

                {/* Текущий тест */}
                {currentTestSuite && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Текущий тест: {currentTestSuite.name}</h2>
                        <p className="text-gray-600 mb-4">{currentTestSuite.description}</p>
                        <div className="space-y-3">
                            {currentTestSuite.steps.map((step) => (
                                <div
                                    key={step.id}
                                    className={`p-4 rounded-lg border ${getStatusColor(step.status)}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(step.status)}
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{step.name}</h3>
                                            <p className="text-sm opacity-75">{step.description}</p>
                                            {step.error && (
                                                <p className="text-sm text-red-600 mt-1">{step.error}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Результаты тестов */}
                {testResults.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Результаты тестов</h2>
                        <div className="space-y-4">
                            {testResults.map((suite) => (
                                <div key={suite.id} className="border rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        {getStatusIcon(suite.status)}
                                        <h3 className="font-semibold">{suite.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${suite.status === 'passed' ? 'bg-green-100 text-green-800' :
                                            suite.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                suite.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {suite.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
                                    <div className="space-y-2">
                                        {suite.steps.map((step) => (
                                            <div
                                                key={step.id}
                                                className={`p-3 rounded border-l-4 ${step.status === 'passed' ? 'border-green-500 bg-green-50' :
                                                    step.status === 'failed' ? 'border-red-500 bg-red-50' :
                                                        step.status === 'running' ? 'border-blue-500 bg-blue-50' :
                                                            'border-gray-300 bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(step.status)}
                                                    <span className="font-medium text-sm">{step.name}</span>
                                                </div>
                                                {step.error && (
                                                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

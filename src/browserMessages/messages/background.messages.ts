import { MessageType } from '../enum/message-type.enum';
import { Message } from './message.interface';
import { ControllerType } from '../enum/controller.type';
import { DomElementSize } from '../../dto/dom-element-size.model';

export const createRecaptchaRecognizedMessage = (domElementSize: DomElementSize): Message<DomElementSize> => ({
    type: MessageType.BACKGROUND_RECAPTCHA_RECOGNIZED,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: domElementSize
});
export type RecaptchaRecognizedMessage = ReturnType<typeof createRecaptchaRecognizedMessage>;


export const createStartVideoInVideoMessage = (): Message => ({
    type: MessageType.BACKGROUND_START_VIDEO_IN_VIDEO,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
});
export type StartVideoInVideoMessage = ReturnType<typeof createStartVideoInVideoMessage>;


export const createMinimizeWindowMessage = (windowId: number): Message<number> => ({
    type: MessageType.BACKGROUND_MINIMIZE_WINDOW,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type MinimizeWindowMessage = ReturnType<typeof createMinimizeWindowMessage>;


export const createToggleWindowFullscreenMessage = (windowId: number): Message<number> => ({
    type: MessageType.BACKGROUND_TOGGLE_WINDOW_FULLSCREEN,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type ToggleWindowFullscreenMessage = ReturnType<typeof createToggleWindowFullscreenMessage>;


export const createMakeWindowFullscreenMessage = (): Message<number> => ({
    type: MessageType.BACKGROUND_MAKE_WINDOW_FULLSCREEN,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false
});
export type MakeWindowFullscreenMessage = ReturnType<typeof createMakeWindowFullscreenMessage>;


export const createToggleWindowMaximizationMessage = (windowId: number): Message<number> => ({
    type: MessageType.BACKGROUND_TOGGLE_WINDOW_MAXIMIZATION,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type ToggleWindowMaximizationMessage = ReturnType<typeof createToggleWindowMaximizationMessage>;


export const createCloseWindowMessage = (windowId: number): Message<number> => ({
    type: MessageType.BACKGROUND_CLOSE_WINDOW,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: windowId
});
export type CloseWindowMessage = ReturnType<typeof createCloseWindowMessage>;


export const createExecuteScriptMessage = (script: string): Message<{ script: string }> => ({
    type: MessageType.BACKGROUND_EXECUTE_SCRIPT,
    destinationController: ControllerType.BACKGROUND,
    hasReply: false,
    payload: { script }
});
export type ExecuteScriptMessage = ReturnType<typeof createExecuteScriptMessage>;



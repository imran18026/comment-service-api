/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  let onlineUsers: string[] = [];

  io.on('connection', async (socket) => {
    console.log('connected', socket?.id);

    try {
      socket.on('join', (userId) => {
        if (!socket.rooms.has(userId)) {
          socket.join(userId);
          if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
          }
        }

        onlineUsers.forEach((user) => {
          io.to(user).emit('online-users-updated', onlineUsers);
        });

        console.log('Online Users', onlineUsers);
      });

      socket.on('send-new-message', (message) => {
        console.log('new message ====>', message);
        message?.chat?.users?.forEach((user: any) => {
          io.to(user._id).emit('new-message-received', message);
        });
      });

      socket.on('read-all-messages', ({ chatId, users, readByUserId }) => {
        users.forEach((user: string) => {
          io.to(user).emit('user-read-all-chat-messages', {
            chatId,
            readByUserId,
          });
        });
      });

      socket.on('typing', ({ chat, senderId, senderName }) => {
        chat.users.forEach((user: any) => {
          if (user._id !== senderId) {
            io.to(user._id).emit('typing', { chat, senderName });
          }
        });
      });

      socket.on('logout', (userId) => {
        socket.leave(userId);
        onlineUsers = onlineUsers.filter((user) => user !== userId);

        onlineUsers.forEach((user) => {
          io.to(user).emit('online-users-updated', onlineUsers);
        });
      });

      //-----------------------Disconnect------------------------//
      socket.on('disconnect', () => {
        console.log('disconnect user ', socket.id);
      });
    } catch (error) {
      console.error('-- socket.io connection error --', error);
    }
  });

  return io;
};

export default initializeSocketIO;

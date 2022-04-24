import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';


const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbGp4ZGtvZGdkeGRrYmF0b2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTA4MTI3MTgsImV4cCI6MTk2NjM4ODcxOH0.Sgy3nZ0onfOGT4HljGRcDJ9yul2N0DJoWsJtB9miReA'
const SUPABASE_URL = 'https://bmljxdkodgdxdkbatoex.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function listenMessagesInRealTime(addNewMessage) {
    return supabaseClient
            .from('messages')
            .on('INSERT', (response) => {
                addNewMessage(response.new);
            })
            .subscribe();
}

export default function chatPage() {
    const routing = useRouter();
    const loggedUser = routing.query.username;
    const [message, setMessage] = useState();
    const [messagesList, setMessagesList] = useState([]);
    
    React.useEffect(() => {
        const supabaseData = supabaseClient
            .from('messages')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data }) => {
                setMessagesList(data);
            });

        listenMessagesInRealTime((newMessage) => {
            setMessagesList(currentListValue => {
                return [
                newMessage,
                ...currentListValue 
                ]
            });
        });
    }, [])


    
    function handleNewMessage(newMessage) {
        const message = {
            //id: messagesList.length + 1,
            from: loggedUser,
            text: newMessage,

        };

        supabaseClient
            .from('messages')
            .insert([message]);          

        setMessage('');
    }

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList message={messagesList}/>

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={message}
                            onChange={e => {
                                const value = e.target.value;
                                setMessage(value);
                            }}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const newMessage = e.target.value;
                                    handleNewMessage(newMessage);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            rows="4"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker onStickerClick={(sticker) => {
                            handleNewMessage(':sticker: ' + sticker);
                        }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >

            {props.message.map(addedMessage => {
                return (
                    <Text
                        key={addedMessage.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${addedMessage.from}.png`}
                            />
                            <Text tag="strong">
                                {addedMessage.from}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {addedMessage.text.startsWith(':sticker:') ? (
                            <Image src={addedMessage.text.replace(':sticker:', '')} styleSheet={{
                                width: '100px'
                            }} />
                        ) : (
                            addedMessage.text
                        )}
                    </Text>
                );
            })}


        </Box>
    )
}
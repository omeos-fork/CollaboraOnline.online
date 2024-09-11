/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */
/*
 * Copyright the Collabora Online contributors.
 *
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

#include <config.h>

#include <string>

#include <HttpRequest.hpp>
#include <Socket.hpp>

#include <test/lokassert.hpp>

#include <Unit.hpp>
#include <UserMessages.hpp>
#include <Util.hpp>
#include <helpers.hpp>

#include "UnitTimeoutBase.hpp"

static constexpr size_t ConnectionLimit = 9999;
static constexpr size_t ConnectionCount = 9;

/// Base test suite class for connection limit (no limits) using HTTP and WS sessions.
class UnitTimeoutNone : public UnitTimeoutBase
{
    void configure(Poco::Util::LayeredConfiguration& config) override
    {
        UnitWSD::configure(config);

        /**
         * Keep original values -> No timeout
        config.setInt("net.ws.ping.timeout", 2000000); // WebSocketHandler ping timeout in us (2s). Zero disables metric.
        config.setInt("net.ws.ping.period", 3000000); // WebSocketHandler ping period in us (3s), i.e. duration until next ping.
        config.setInt("net.http.timeout", 30000000); // http::Session timeout in us (30s). Zero disables metric.
        config.setInt("net.maxconnections", 100000); // Socket maximum connections (100000). Zero disables metric.
        config.setInt("net.maxduration", 43200); // Socket maximum duration in seconds (12h). Zero disables metric.
        config.setInt("net.minbps", 0); // Socket minimum bits per seconds throughput (0). Increase for debugging. Zero disables metric.
        config.setInt("net.socketpoll.timeout", 64000000); // SocketPoll timeout in us (64s).
        */
    }

public:
    UnitTimeoutNone()
        : UnitTimeoutBase("UnitTimeoutNone")
    {
    }

    void invokeWSDTest() override;
};

void UnitTimeoutNone::invokeWSDTest()
{
    UnitBase::TestResult result;

    result = testHttp(ConnectionLimit, ConnectionCount);
    if (result != TestResult::Ok)
        exitTest(result);

    result = testWSPing(ConnectionLimit, ConnectionCount);
    if (result != TestResult::Ok)
        exitTest(result);

    result = testWSDChatPing(ConnectionLimit, ConnectionCount);
    if (result != TestResult::Ok)
        exitTest(result);

    exitTest(TestResult::Ok);
}

UnitBase* unit_create_wsd(void) { return new UnitTimeoutNone(); }

/* vim:set shiftwidth=4 softtabstop=4 expandtab: */
